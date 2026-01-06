// deno-lint-ignore-file
// Follows Deno/Supabase Edge Function syntax
declare const Deno: {
    env: {
        get(key: string): string | undefined;
    };
};
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    // Handle CORS preflight request
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Parse the request body (Expects the application_id)
        const { record } = await req.json();
        const applicationId = record?.id;
        const jobId = record?.job_id;
        const applicantId = record?.applicant_id;

        if (!applicationId || !jobId || !applicantId) {
            throw new Error("Missing required fields: id, job_id, or applicant_id");
        }

        // 2. Initialize Supabase Admin Client (Bypass RLS to read all data & update score)
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 3. Fetch Job Data (Requirements, Description, Title)
        const { data: job, error: jobError } = await supabaseAdmin
            .from("jobs")
            .select("title, description, requirements, salary_range_min, salary_range_max")
            .eq("id", jobId)
            .single();

        if (jobError) throw new Error(`Failed to fetch job: ${jobError.message}`);

        // 4. Fetch Applicant Profile (Skills, Experience, Title)
        // Note: This relies on the 'Smart Resume Parser' tool having already populated these fields.
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("job_title, experience_years, skills, location")
            .eq("id", applicantId)
            .single();

        if (profileError) throw new Error(`Failed to fetch profile: ${profileError.message}`);

        // 5. Construct the AI Prompt
        // We package the data into a clear context for the LLM
        const prompt = `
      You are an expert AI Recruiter. Evaluate the fit between the following Candidate and Job.
      
      JOB DETAILS:
      - Title: ${job.title}
      - Description: ${job.description.slice(0, 1000)}... (truncated)
      - Key Requirements: ${job.requirements ? job.requirements.join(", ") : "N/A"}
      - Salary Range: ${job.salary_range_min} - ${job.salary_range_max}

      CANDIDATE PROFILE:
      - Current Title: ${profile.job_title}
      - Experience: ${profile.experience_years} years
      - Skills: ${profile.skills ? profile.skills.join(", ") : "N/A"}
      - Location: ${profile.location}

      TASK:
      1. Analyze the semantic match between the candidate's skills/experience and the job requirements.
      2. Provide a compatibility score from 0 to 100 (integer).
      3. Provide a list of 3-5 specific "match reasons" justifying the score.

      OUTPUT FORMAT (JSON ONLY):
      {
        "score": number,
        "match_reasons": ["reason 1", "reason 2"...]
      }
    `;

        // 6. Call OpenAI API
        const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
            },
            body: JSON.stringify({
                model: "gpt-4-turbo", // or gpt-3.5-turbo for lower cost
                messages: [
                    { role: "system", content: "You are a helpful hiring assistant that outputs strict JSON." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.2, // Low temperature for consistent, analytical results
            }),
        });

        const aiData = await openAIResponse.json();

        // Parse the AI content
        let result;
        try {
            const contentString = aiData.choices[0].message.content;
            result = JSON.parse(contentString);
        } catch (e) {
            console.error("AI Parse Error:", e);
            // Fallback if AI fails
            result = { score: 0, match_reasons: ["AI analysis failed, pending manual review."] };
        }

        // 7. Update the Application Record with the Score
        const { error: updateError } = await supabaseAdmin
            .from("applications")
            .update({
                score: result.score,
                match_reasons: result.match_reasons,
                status: "reviewed", // Auto-move to reviewed if processed successfully
            })
            .eq("id", applicationId);

        if (updateError) throw new Error(`Failed to update application: ${updateError.message}`);

        return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: unknown) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
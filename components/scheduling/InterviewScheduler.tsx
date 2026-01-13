'use client';

import { useState } from 'react';
import { Calendar, Clock, Video, MapPin, X, Check, Loader2 } from 'lucide-react';

interface InterviewSchedulerProps {
    applicationId: string;
    applicantName: string;
    jobTitle: string;
    onScheduled?: () => void;
    onClose: () => void;
}

export function InterviewScheduler({
    applicationId,
    applicantName,
    jobTitle,
    onScheduled,
    onClose,
}: InterviewSchedulerProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        duration: 60,
        meetingLink: '',
        location: '',
        isVirtual: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.date || !formData.time) {
            setError('Please select date and time');
            return;
        }

        setIsSubmitting(true);

        try {
            const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();

            const res = await fetch('/api/interviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId,
                    scheduledAt,
                    durationMinutes: formData.duration,
                    meetingLink: formData.isVirtual ? formData.meetingLink : null,
                    location: !formData.isVirtual ? formData.location : null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to schedule');
            }

            console.log('[InterviewScheduler] Scheduled successfully');
            onScheduled?.();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[#15171e] border border-gray-800 rounded-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Schedule Interview</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-400">Candidate</p>
                    <p className="font-medium text-white">{applicantName}</p>
                    <p className="text-sm text-gray-500">{jobTitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Duration</label>
                        <select
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                        >
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={90}>1.5 hours</option>
                            <option value={120}>2 hours</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isVirtual: true })}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${formData.isVirtual
                                ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]'
                                : 'border-gray-700 text-gray-400'
                                }`}
                        >
                            <Video className="w-4 h-4" /> Virtual
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isVirtual: false })}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${!formData.isVirtual
                                ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]'
                                : 'border-gray-700 text-gray-400'
                                }`}
                        >
                            <MapPin className="w-4 h-4" /> In-Person
                        </button>
                    </div>

                    {formData.isVirtual ? (
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Meeting Link</label>
                            <input
                                type="url"
                                value={formData.meetingLink}
                                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                placeholder="https://zoom.us/j/..."
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Office address..."
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-[var(--primary-blue)] hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Scheduling...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" /> Schedule
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

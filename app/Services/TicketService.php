<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TicketService
{
    public function indexData(Business $business, array $filters): array
    {
        $status = $filters['status'] ?? 'all';
        $tickets = $business->tickets()
            ->with('latestReply:id,ticket_id,message,created_at,is_staff')
            ->withCount('replies')
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->latest()
            ->get(['id', 'business_id', 'ticket_number', 'subject', 'description', 'status', 'priority', 'images', 'created_at'])
            ->map(fn (Ticket $ticket) => $this->summary($ticket));

        $counts = $business->tickets()
            ->selectRaw("COUNT(*) as `all`, COALESCE(SUM(status = 'open'), 0) as open, COALESCE(SUM(status = 'in_progress'), 0) as in_progress, COALESCE(SUM(status = 'resolved'), 0) as resolved, COALESCE(SUM(status = 'closed'), 0) as closed")
            ->first();

        return [
            'tickets' => $tickets,
            'counts' => [
                'all' => (int) $counts->all, 'open' => (int) $counts->open,
                'in_progress' => (int) $counts->in_progress, 'resolved' => (int) $counts->resolved,
                'closed' => (int) $counts->closed,
            ],
            'currentStatus' => $status,
        ];
    }

    public function create(Business $business, array $data, array $images): Ticket
    {
        return $business->tickets()->create([
            'ticket_number' => Ticket::generateTicketNumber(),
            'subject' => $data['subject'], 'description' => $data['description'], 'priority' => $data['priority'],
            'images' => $this->storeImages($images, 'tickets'), 'status' => 'open',
        ]);
    }

    public function show(Business $business, int $ticketId): array
    {
        $ticket = $business->tickets()
            ->with(['replies:id,ticket_id,user_id,message,images,is_staff,created_at', 'replies.user:id,name,email'])
            ->findOrFail($ticketId);

        return [
            'id' => $ticket->id, 'ticket_number' => $ticket->ticket_number, 'subject' => $ticket->subject,
            'description' => $ticket->description, 'status' => $ticket->status, 'priority' => $ticket->priority,
            'status_color' => $ticket->status_color, 'priority_color' => $ticket->priority_color,
            'created_at' => $ticket->created_at->format('M d, Y h:i A'),
            'images' => $this->imageUrls($ticket->images),
            'replies' => $ticket->replies->map(fn (TicketReply $reply) => [
                'id' => $reply->id, 'message' => $reply->message, 'is_staff' => $reply->is_staff,
                'created_at' => $reply->created_at->format('M d, Y h:i A'), 'images' => $this->imageUrls($reply->images),
                'user' => $reply->user ? ['name' => $reply->user->name, 'email' => $reply->user->email] : null,
            ]),
        ];
    }

    public function reply(Business $business, int $ticketId, int $userId, array $data, array $images): TicketReply
    {
        $ticket = $business->tickets()->findOrFail($ticketId);

        return $ticket->replies()->create([
            'user_id' => $userId, 'message' => $data['message'], 'images' => $this->storeImages($images, 'ticket-replies'), 'is_staff' => false,
        ]);
    }

    private function summary(Ticket $ticket): array
    {
        return [
            'id' => $ticket->id, 'ticket_number' => $ticket->ticket_number, 'subject' => $ticket->subject,
            'description' => $ticket->description, 'status' => $ticket->status, 'priority' => $ticket->priority,
            'status_color' => $ticket->status_color, 'priority_color' => $ticket->priority_color,
            'created_at' => $ticket->created_at->format('M d, Y h:i A'), 'replies_count' => $ticket->replies_count,
            'has_images' => ! empty($ticket->images),
            'last_reply' => $ticket->latestReply ? [
                'message' => $ticket->latestReply->message,
                'created_at' => $ticket->latestReply->created_at->format('M d, Y h:i A'),
                'is_staff' => $ticket->latestReply->is_staff,
            ] : null,
        ];
    }

    /** @param array<int, UploadedFile> $images */
    private function storeImages(array $images, string $directory): array
    {
        return collect($images)->map(fn (UploadedFile $image) => $image->store($directory, 'public'))->all();
    }

    private function imageUrls(?array $paths): array
    {
        return collect($paths ?? [])->map(fn (string $path) => Storage::url($path))->all();
    }
}

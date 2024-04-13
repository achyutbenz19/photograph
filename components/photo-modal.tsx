"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";

export function PhotoModal() {
    const { isOpen, onClose, data } = useModal();

    function formatVideo(video: string) {
        video.replace(/^\.\.\/public\//, '');
        return video
    }

    console.log(data)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full border-2 text-white">

            </DialogContent>
        </Dialog>
    );
}

"use client";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import Image from "next/image";

export function PhotoModal() {
    const { isOpen, onClose, data } = useModal();

    if (!isOpen || !data || data.length === undefined) return null;

    function consolidateData(items: any): any {
        const dataMap = new Map<string, { connections: string[]; description: string; data: string }>();

        items && data && items.forEach((item: { data: string; connection: string; description: string; }) => {
            const existingEntry = dataMap.get(item.data);
            if (existingEntry) {
                existingEntry.connections.push(item.connection);
                existingEntry.description += " " + item.description;
            } else {
                dataMap.set(item.data, {
                    connections: [item.connection],
                    description: item.description,
                    data: item.data.replace(/^\.\.\/public\//, '')
                });
            }
        });

        const result = Array.from(dataMap.values()).map(entry => ({
            data: entry.data,
            connection: entry.connections.join(', '),
            description: entry.description
        }));
        console.log(result)
        return result;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full border-2 text-white">
                {data && consolidateData(data).map((value: any, index: number) => (
                    <div className="flex flex-col text-white" key={index}>
                        <h3 className="text-3xl">{value.connection}</h3>
                        <Image src={`/${value.data}`} alt={`${value.data}`} height={100} width={100} />
                        <h3 className="text-xl">{value.description}</h3>
                    </div>
                ))}
            </DialogContent>
        </Dialog>
    );
}

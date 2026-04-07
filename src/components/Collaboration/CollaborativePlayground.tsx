import { useEffect, useState } from 'react';

import { DoorOpen } from 'lucide-react';
import { useParams } from 'react-router';

import Canvas from '@/components/Canvas/Canvas';
import CursorOverlay from '@/components/Canvas/CursorOverlay';
import ToolsMenu from '@/components/Canvas/ToolMenu';
import ToolSettingMenu from '@/components/Canvas/ToolSettingMenu';
import UtilsMenu from '@/components/Canvas/UtilsMenu';
import ZoomMenu from '@/components/Canvas/ZoomMenu';
import CollaboratorsMenu from '@/components/Collaboration/CollaboratorsMenu';
import SessionClosedOverlay from '@/components/Collaboration/SessionClosedOverlay';
import { socket } from '@/lib/socket';

import Button from '../ui/button';

export default function CollaborativePlayground() {
    const [isActive, setIsActive] = useState(false);
    const [overlayReason, setOverlayReason] =
        useState<ExitReason>('host-ended');

    const { roomId } = useParams();

    useEffect(() => {
        if (!roomId) return;

        const isOwner = localStorage.getItem('isRoomOwner') === 'true';
        const storedRoomId = localStorage.getItem('ownerRoomId');
        const isActualOwner = isOwner && storedRoomId === roomId;

        localStorage.removeItem('isRoomOwner');
        localStorage.removeItem('ownerRoomId');

        if (isActualOwner) {
            socket.emit('register-room', { roomId, isOwner: isActualOwner });
        } else {
            socket.emit('join-room', { roomId });
        }

        const handleRoomClosed = () => {
            setIsActive(true);
            setOverlayReason((prev) =>
                prev === 'self-exit' ? prev : 'host-ended',
            );
        };

        socket.on('room-closed', handleRoomClosed);

        return () => {
            socket.off('room-closed', handleRoomClosed);
        };
    }, [roomId]);

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <Button
                onClick={() => {
                    setIsActive(true);
                    setOverlayReason('self-exit');
                    localStorage.removeItem('drawing-store');
                }}
                className="absolute top-5 right-5 flex w-fit items-center gap-0.5 rounded-sm"
            >
                <DoorOpen className="size-4" /> Exit
            </Button>

            <SessionClosedOverlay isActive={isActive} reason={overlayReason} />

            <ToolsMenu />
            <Canvas />
            <CollaboratorsMenu />
            <CursorOverlay />
            <ZoomMenu />
            <ToolSettingMenu />
            <UtilsMenu />
        </div>
    );
}

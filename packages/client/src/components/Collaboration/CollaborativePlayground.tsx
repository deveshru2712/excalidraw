import { useEffect, useState } from 'react';

import { DoorOpen, EllipsisVertical, RefreshCw } from 'lucide-react';
import { useParams } from 'react-router';

import Button from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import CursorOverlay from '@/components/Canvas/CursorOverlay';
import ToolsMenu from '@/components/Canvas/ToolMenu';
import ToolSettingMenu from '@/components/Canvas/ToolSettingMenu';
import UtilsMenu from '@/components/Canvas/UtilsMenu';
import ZoomMenu from '@/components/Canvas/ZoomMenu';
import CollaborationCanvas from '@/components/Collaboration/CollaborationCanvas';
import CollaboratorsMenu from '@/components/Collaboration/CollaboratorsMenu';
import RoomNotFound from '@/components/Collaboration/RoomNotFound';
import SessionClosedOverlay from '@/components/Collaboration/SessionClosedOverlay';
import { socket } from '@/lib/socket';
import { useDrawingStore } from '@/stores/useDrawingStore';

export default function CollaborativePlayground() {
    const syncElement = useDrawingStore((state) => state.syncCanvas);

    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState(false);
    const [overlayReason, setOverlayReason] =
        useState<ExitReason>('host-ended');

    const { roomId } = useParams();

    const isActualOwner =
        localStorage.getItem('isRoomOwner') === 'true' &&
        localStorage.getItem('ownerRoomId') === roomId;

    useEffect(() => {
        if (!roomId || isActualOwner === null) return;

        if (!socket.connected) {
            socket.connect();
        }

        if (!isActualOwner) {
            localStorage.removeItem('drawing-store');
        }

        const fullFillReq = () => {
            const latestElements = useDrawingStore.getState().elements;

            console.log(latestElements);

            socket.emit('sync-canvas', {
                roomId,
                elements: latestElements,
            });
        };

        if (isActualOwner) {
            socket.emit('register-room', { roomId, isOwner: true });
            socket.on('request-sync', fullFillReq);
        } else {
            socket.emit('join-room', { roomId });
        }

        const handleRoomClosed = () => {
            setIsActive(true);
            setOverlayReason('host-ended');
        };

        const handleRoomNotFound = () => {
            setError(true);
        };

        const handleCanvasSynced = (data: SyncEventPayload) => {
            if (!data?.elements) return;
            console.log('yay');
            syncElement(data.elements);
        };

        socket.on('room-shutdown', handleRoomClosed);
        socket.on('room-not-found', handleRoomNotFound);
        socket.on('canvas-synced', handleCanvasSynced);

        return () => {
            socket.off('room-shutdown', handleRoomClosed);
            socket.off('room-not-found', handleRoomNotFound);
            socket.off('canvas-synced', handleCanvasSynced);
            socket.off('request-sync', fullFillReq);

            if (roomId && socket.connected) {
                socket.emit('exit-room', { roomId });
            }
        };
    }, [roomId, isActualOwner, syncElement]);

    if (!roomId || error) {
        return <RoomNotFound />;
    }

    if (isActualOwner === null) {
        return (
            <div className="text-muted-foreground flex h-screen w-full items-center justify-center text-sm">
                Joining room...
            </div>
        );
    }

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <div className="absolute top-5 right-5 flex w-fit items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button variant="outline" size="icon">
                                <EllipsisVertical className="size-4" />
                            </Button>
                        }
                    />

                    <DropdownMenuContent className="min-w-28 p-1">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-xs">
                                Menu
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                className="flex items-center gap-2 px-2 py-1.5 text-sm"
                                onClick={() => {
                                    setIsActive(true);

                                    if (isActualOwner) {
                                        setOverlayReason('host-ended');
                                        socket.emit('close-room', { roomId });
                                    } else {
                                        setOverlayReason('self-exit');
                                        socket.emit('exit-room', { roomId });
                                    }

                                    localStorage.removeItem('drawing-store');
                                }}
                            >
                                <DoorOpen className="size-4 text-red-500" />
                                <span className="whitespace-nowrap text-red-500">
                                    Exit
                                </span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="flex items-center gap-2 px-2 py-1.5 text-sm"
                                onClick={() => {
                                    if (isActualOwner) {
                                        const latestElements =
                                            useDrawingStore.getState().elements;

                                        socket.emit('sync-canvas', {
                                            roomId,
                                            elements: latestElements,
                                        });
                                    } else {
                                        // client request for sync
                                        socket.emit('req-sync', roomId);
                                        console.log('request');
                                    }
                                }}
                            >
                                <RefreshCw className="text-muted-foreground size-4" />
                                <span className="text-muted-foreground whitespace-nowrap">
                                    Sync
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <SessionClosedOverlay isActive={isActive} reason={overlayReason} />
            <ToolsMenu />
            <CollaborationCanvas roomId={roomId} />
            <CollaboratorsMenu />
            <CursorOverlay />
            <ZoomMenu />
            <ToolSettingMenu />
            <UtilsMenu />
        </div>
    );
}

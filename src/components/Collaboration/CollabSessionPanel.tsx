import { useState } from 'react';

import { Copy, Users, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Link } from 'react-router';

import Button from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CollabSessionPanelProps {
    isOpen: boolean;
    handleClose: () => void;
}

export default function CollabSessionPanel({
    handleClose,
    isOpen,
}: CollabSessionPanelProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(roomUrl);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 3000);
    };

    const roomId = useState(() => nanoid())[0];

    const roomPath = `/room/${roomId}`;
    const roomUrl = `localhost:5173${roomPath}`;

    if (!isOpen) return;

    return (
        <div className="absolute inset-0 z-100 h-screen w-full bg-black/10 backdrop-blur-xs">
            <Card className="relative top-1/2 left-1/2 max-w-sm -translate-x-1/2 -translate-y-1/2 gap-2.5 rounded-md">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="grid gap-0.5">
                            <CardTitle className="flex items-center gap-1 text-sm">
                                <Users className="size-6 rounded-sm bg-black/10 p-1" />
                                Start collaborating
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Share the link and draw together in real time
                            </CardDescription>
                        </div>

                        <Button
                            onClick={handleClose}
                            variant={'outline'}
                            size={'icon-xs'}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-1.5">
                    {/* username */}
                    <div className="grid gap-0.5">
                        <Label htmlFor="username" className="text-sm">
                            Username
                        </Label>
                        <Input
                            id="username"
                            placeholder="Jhon Doe..."
                            className="h-fit border! border-gray-400/20! py-1.5 text-xs"
                        />
                    </div>
                    {/* Room Id */}
                    <div className="grid gap-0.5">
                        <Label htmlFor="roomId" className="text-sm">
                            Room Id
                        </Label>
                        <Input
                            id="roomId"
                            className="h-fit border! border-gray-400/20! py-1.5 text-xs"
                            value={roomId}
                            disabled
                        />
                    </div>

                    {/* invite url */}
                    <div className="grid gap-0.5">
                        <Label htmlFor="roomurl" className="text-sm">
                            Invite Link
                        </Label>

                        <div className="flex items-center gap-1.5">
                            <Input
                                id="roomurl"
                                className="h-fit min-w-0! flex-1 border! border-gray-400/20! py-1.5 text-xs"
                                value={roomUrl.slice(0, 30) + `...`}
                                disabled
                            />

                            <Button
                                onClick={handleCopy}
                                size="sm"
                                className="shrink-0 cursor-pointer"
                                variant="outline"
                            >
                                <Copy className="mr-0.5 size-4" />

                                <span className="relative inline-block">
                                    <span className="invisible text-sm">
                                        Copied
                                    </span>

                                    <span
                                        className={`absolute inset-0 transition-all duration-300 ${
                                            isCopied
                                                ? 'opacity-0'
                                                : 'opacity-100'
                                        }`}
                                    >
                                        Copy
                                    </span>

                                    <span
                                        className={`absolute inset-0 transition-all duration-300 ${
                                            isCopied
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        }`}
                                    >
                                        Copied
                                    </span>
                                </span>
                            </Button>
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    <Link
                        to={roomPath}
                        onClick={() => {
                            localStorage.removeItem('drawing-store');
                            localStorage.setItem('isRoomOwner', 'true');
                            localStorage.setItem('ownerRoomId', roomId);
                        }}
                        className="w-full rounded-sm bg-black py-1 text-center font-medium text-white hover:bg-black/90"
                    >
                        Start Drawing
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

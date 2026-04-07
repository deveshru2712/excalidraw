import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import Button from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type ExitReason = 'host-ended' | 'self-exit';

interface SessionClosedOverlayProps {
    isActive: boolean;
    reason: ExitReason;
}

const SESSION_CLOSED_MESSAGES = [
    {
        condition: (reason: ExitReason, isActualOwner: boolean) =>
            isActualOwner && reason === 'host-ended',
        icon: '🛑',
        title: 'You ended the session',
        description: "You've closed the room for everyone.",
        subDescription: 'All participants have been disconnected.',
        buttonText: 'Create a new session →',
    },
    {
        condition: (reason: ExitReason, isActualOwner: boolean) =>
            !isActualOwner && reason === 'self-exit',
        icon: '🚪',
        title: 'You left the session',
        description: "You've exited the room.",
        subDescription: "You can rejoin anytime if it's still active.",
        buttonText: 'Return to Playground →',
    },
];

const DEFAULT_SESSION_CLOSED_MESSAGE = {
    icon: '🎬',
    title: 'Session has ended',
    description: 'The host has ended this session.',
    subDescription: 'Hope you had a great collaboration ✨',
    buttonText: 'Back to Playground →',
};

export default function SessionClosedOverlay({
    isActive,
    reason,
}: SessionClosedOverlayProps) {
    const [counter, setCounter] = useState(5);
    const { roomId } = useParams();
    const navigate = useNavigate();

    const isOwner = localStorage.getItem('isRoomOwner') === 'true';
    const storedRoomId = localStorage.getItem('ownerRoomId');
    const isActualOwner = isOwner && storedRoomId === roomId;

    const message =
        SESSION_CLOSED_MESSAGES.find((m) =>
            m.condition(reason, isActualOwner),
        ) || DEFAULT_SESSION_CLOSED_MESSAGE;

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setCounter((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    navigate('/playground');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, navigate]);

    if (!isActive) return null;

    return (
        <div className="animate-in fade-in absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md duration-300">
            <Card className="bg-background/95 w-full max-w-md rounded-2xl border shadow-2xl">
                <CardHeader className="space-y-3 text-center">
                    <div className="text-4xl">{message.icon}</div>

                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        {message.title}
                    </CardTitle>

                    <CardDescription className="text-base leading-relaxed">
                        {message.description}
                        <br />
                        <span className="text-muted-foreground">
                            {message.subDescription}
                        </span>
                    </CardDescription>
                </CardHeader>

                <CardFooter className="flex flex-col items-center gap-4 pt-3">
                    <Button
                        size="lg"
                        className="w-full"
                        onClick={() => navigate('/playground')}
                    >
                        {message.buttonText}
                    </Button>

                    <p className="text-muted-foreground text-sm">
                        Redirecting{' '}
                        <span className="text-foreground text-base font-semibold">
                            {counter}
                        </span>{' '}
                        second{counter !== 1 && 's'}…
                    </p>

                    <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                        <div
                            className="bg-primary h-full transition-all duration-1000"
                            style={{ width: `${(counter / 5) * 100}%` }}
                        />
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router';

import Button from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function RoomNotFound() {
    const navigate = useNavigate();
    const [counter, setCounter] = useState(5);

    useEffect(() => {
        if (counter === 0) {
            navigate('/playground');
            return;
        }

        const timer = setTimeout(() => {
            setCounter((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [counter, navigate]);

    return (
        <div className="animate-in fade-in absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md duration-300">
            <Card className="bg-background/95 w-full max-w-md rounded-2xl border shadow-2xl">
                <CardHeader className="space-y-3 text-center">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Can't detect a valid session
                    </CardTitle>

                    <CardDescription className="text-base leading-relaxed">
                        Something went wrong.
                        <br />
                        <span className="text-muted-foreground">
                            Please ask to create another meeting
                        </span>
                    </CardDescription>
                </CardHeader>

                <CardFooter className="flex flex-col items-center gap-4 pt-3">
                    <Button
                        size="lg"
                        className="w-full"
                        onClick={() => navigate('/playground')}
                    >
                        Go back to playground now
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
                            className="bg-primary ml-auto h-full transition-all duration-1000"
                            style={{ width: `${(counter / 5) * 100}%` }}
                        />
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

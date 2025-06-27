'use client';

import { useEffect, useState } from "react";

export default function AudioPlayer({ text, className }) {
    const [audioUrl, setAudioUrl] = useState(null);

    useEffect(() => {
        if (!text) return;

        const synthesizeSpeech = async () => {
            try {
                const api_url = process.env.NEXT_PUBLIC_API_SPEECH_URL;
                const token = process.env.NEXT_PUBLIC_API_SPEECH_TOKEN;

                const response = await fetch(api_url, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: text,
                        speaker_id: '1',
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Ошибка от API:', errorText);
                    return;
                }

                // Проверяем Content-Type, если JSON — значит ошибка
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorJson = await response.json();
                    console.error('Ошибка от API:', errorJson);
                    return;
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                console.log(url);
            } catch (error) {
                console.error('Ошибка запроса:', error);
            }
        };

        synthesizeSpeech();
    }, [text]);

    return (
        <>
            {audioUrl ? (
                <audio className={className} controls autoPlay src={audioUrl}>
                    Ваш браузер не поддерживает аудио.
                </audio>
            ) : (
                <p>Загрузка аудио...</p>
            )}
        </>
    );
}

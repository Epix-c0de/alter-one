import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react-native';
import Colors from '@/constants/colors';
import type { FeedMedia } from '@/types/feed.types';

interface FeedVideoPlayerProps {
    media: FeedMedia;
    autoPlay?: boolean;
}

export default function FeedVideoPlayer({ media, autoPlay = false }: FeedVideoPlayerProps) {
    const videoRef = useRef<Video>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(true);
    const [showControls, setShowControls] = useState(true);

    const togglePlayPause = async () => {
        if (videoRef.current) {
            if (isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const handlePlaybackStatusUpdate = (status: any) => {
        if (status.didJustFinish) {
            setIsPlaying(false);
            videoRef.current?.setPositionAsync(0);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowControls(!showControls)}
                style={styles.videoContainer}
            >
                <Video
                    ref={videoRef}
                    source={{ uri: media.url }}
                    style={styles.video}
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    isMuted={isMuted}
                    shouldPlay={autoPlay}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />

                {/* Controls Overlay */}
                {showControls && (
                    <View style={styles.controlsOverlay}>
                        {/* Play/Pause Button */}
                        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                            {isPlaying ? (
                                <Pause size={40} color="#fff" fill="#fff" />
                            ) : (
                                <Play size={40} color="#fff" fill="#fff" />
                            )}
                        </TouchableOpacity>

                        {/* Mute Button */}
                        <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
                            {isMuted ? (
                                <VolumeX size={24} color="#fff" />
                            ) : (
                                <Volume2 size={24} color="#fff" />
                            )}
                        </TouchableOpacity>

                        {/* Duration Badge */}
                        {media.duration_seconds && (
                            <View style={styles.durationBadge}>
                                <Text style={styles.durationText}>
                                    {Math.floor(media.duration_seconds / 60)}:
                                    {(media.duration_seconds % 60).toString().padStart(2, '0')}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    videoContainer: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    controlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    muteButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    durationText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

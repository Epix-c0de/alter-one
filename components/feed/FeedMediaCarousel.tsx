import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import type { FeedMedia } from '@/types/feed.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 64; // Account for card padding

interface FeedMediaCarouselProps {
    media: FeedMedia[];
}

export default function FeedMediaCarousel({ media }: FeedMediaCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    if (media.length === 0) return null;

    // Single image
    if (media.length === 1) {
        return (
            <Image
                source={{ uri: media[0].url }}
                style={styles.singleImage}
                contentFit="cover"
            />
        );
    }

    // Multiple images - carousel
    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / IMAGE_WIDTH);
        setActiveIndex(index);
    };

    return (
        <View style={styles.carouselContainer}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {media.map((item, index) => (
                    <Image
                        key={item.id}
                        source={{ uri: item.url }}
                        style={styles.carouselImage}
                        contentFit="cover"
                    />
                ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {media.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            index === activeIndex && styles.paginationDotActive,
                        ]}
                    />
                ))}
            </View>

            {/* Image Counter */}
            <View style={styles.counter}>
                <View style={styles.counterBadge}>
                    <Text style={styles.counterText}>
                        {activeIndex + 1}/{media.length}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    singleImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        backgroundColor: Colors.light.surface,
        marginBottom: 12,
    },
    carouselContainer: {
        marginBottom: 12,
        position: 'relative',
    },
    scrollView: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    carouselImage: {
        width: IMAGE_WIDTH,
        height: 250,
        backgroundColor: Colors.light.surface,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.light.borderLight,
    },
    paginationDotActive: {
        width: 20,
        backgroundColor: Colors.light.primary,
    },
    counter: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    counterBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    counterText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

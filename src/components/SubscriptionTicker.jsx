import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Crown, Star, Flame, Diamond } from 'lucide-react';

const items = [
    { icon: Zap, color: '#ef4444', label: 'UNLOCK PREMIUM FEATURES' },
    { icon: null, color: null, label: null, separator: true },
    { icon: Crown, color: '#f87171', label: 'GET ELITE STATUS' },
    { icon: null, color: null, label: null, separator: true },
    { icon: Star, color: '#ef4444', label: 'BOOST YOUR EARNINGS' },
    { icon: null, color: null, label: null, separator: true },
    { icon: Flame, color: '#f87171', label: 'SAVE 17% ON YEARLY PLANS' },
    { icon: null, color: null, label: null, separator: true },
    { icon: Diamond, color: '#ef4444', label: 'UP TO 2500 COINS / MONTH' },
    { icon: null, color: null, label: null, separator: true },
];

// Duplicate for seamless infinite loop
const tickerItems = [...items, ...items, ...items];

const SubscriptionTicker = () => {
    return (
        <Link
            to="/subscription"
            className="fixed bottom-0 left-0 right-0 z-[100] overflow-hidden block"
            style={{
                height: '36px',
                background: 'rgba(5,5,5,0.96)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(239,68,68,0.15)',
            }}
        >
            {/* Top hairline glow */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.5) 30%, rgba(239,68,68,0.8) 50%, rgba(239,68,68,0.5) 70%, transparent 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Left + right fade masks */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '80px',
                    background: 'linear-gradient(90deg, rgba(5,5,5,1) 0%, transparent 100%)',
                    zIndex: 2,
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '80px',
                    background: 'linear-gradient(270deg, rgba(5,5,5,1) 0%, transparent 100%)',
                    zIndex: 2,
                    pointerEvents: 'none',
                }}
            />

            {/* Scrolling track */}
            <motion.div
                className="flex items-center h-full"
                style={{ width: 'max-content' }}
                animate={{ x: ['0%', '-33.333%'] }}
                transition={{
                    repeat: Infinity,
                    ease: 'linear',
                    duration: 28,
                }}
            >
                {tickerItems.map((item, i) => {
                    if (item.separator) {
                        return (
                            <div
                                key={i}
                                style={{
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    background: 'rgba(239,68,68,0.4)',
                                    marginLeft: '28px',
                                    marginRight: '28px',
                                    flexShrink: 0,
                                }}
                            />
                        );
                    }

                    const Icon = item.icon;
                    return (
                        <span
                            key={i}
                            className="flex items-center gap-2 whitespace-nowrap"
                            style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.12em',
                                color: 'rgba(255,255,255,0.75)',
                                textTransform: 'uppercase',
                                fontFamily: 'inherit',
                                flexShrink: 0,
                            }}
                        >
                            {Icon && (
                                <Icon
                                    style={{
                                        width: '11px',
                                        height: '11px',
                                        color: item.color,
                                        fill: item.color,
                                        filter: `drop-shadow(0 0 4px ${item.color}99)`,
                                        flexShrink: 0,
                                    }}
                                />
                            )}
                            {item.label}
                        </span>
                    );
                })}
            </motion.div>
        </Link>
    );
};

export default SubscriptionTicker;

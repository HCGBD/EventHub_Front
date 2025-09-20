'use client';;
import * as React from 'react';
import { motion, useInView } from 'motion/react';

const defaultItemVariant = {
  hidden: { x: 150, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

export const SplittingText = ({
  ref,
  text,
  type = 'chars',
  motionVariants = {},
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  delay = 0,
  ...props
}) => {
  const items = React.useMemo(() => {
    if (Array.isArray(text)) {
      return text.flatMap((line, i) => [
        <React.Fragment key={`line-${i}`}>{line}</React.Fragment>,
        i < text.length - 1 ? <br key={`br-${i}`} /> : null,
      ]);
    }
 
    if (type === 'words') {
      const tokens = text.match(/\S+\s*/g) || [];
      return tokens.map((token, i) => (
        <React.Fragment key={i}>{token}</React.Fragment>
      ));
    }
 
    return text
      .split('')
      .map((char, i) => <React.Fragment key={i}>{char}</React.Fragment>);
  }, [text, type]);
 
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay / 1000,
        staggerChildren:
          motionVariants.stagger ??
          (type === 'chars' ? 0.05 : type === 'words' ? 0.2 : 0.3),
      },
    },
  };
 
  const itemVariants = {
    hidden: {
      ...defaultItemVariant.hidden,
      ...(motionVariants.initial || {}),
    },
    visible: {
      ...defaultItemVariant.visible,
      ...(motionVariants.animate || {}),
      transition: {
        ...((defaultItemVariant.visible).transition ||
          {}),
        ...(motionVariants.transition || {}),
      },
    },
  };
 
  const localRef = React.useRef(null);
  React.useImperativeHandle(ref, () => localRef.current);
 
  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;
 
  return (
    <motion.span
      ref={localRef}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      {...props}>
      {items.map((item, index) =>
        item && (
          <React.Fragment key={index}>
            <motion.span
              key={index}
              variants={itemVariants}
              style={{
                display: 'inline-block',
                whiteSpace:
                  type === 'chars'
                    ? 'pre'
                    : Array.isArray(text)
                      ? 'normal'
                      : 'normal',
              }}>
              {item}
            </motion.span>
            {type === 'words' && ' '}
          </React.Fragment>
        ))}
    </motion.span>
  );
};
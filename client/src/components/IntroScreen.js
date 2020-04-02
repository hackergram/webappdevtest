import React, {useEffect} from 'react';
import {motion, useAnimation} from 'framer-motion'
import {PageView} from './Tracking';

export function IntroScreen(props) {
    const {selectedCity} = props;
    const controls = useAnimation();
    const contentControls = useAnimation();
    const close = {height: 0, transition: {ease: "easeInOut", duration: 1}}

    useEffect(()=>{
        contentControls.start({y: 0, opacity: 1, transition: {ease: 'easeInOut'}})
    },[])
    return (
        <motion.div
            className="introScreenContainer"
            animate={controls}
        >
            <motion.div
                className="introScreenContent"
                initial = {{y: 10, opacity: 0}}
                animate={contentControls}
            >
                <h1>Hey! Whats this?</h1>
                <p> Looks like points on a map!
                </p>
                <motion.button
                    className="primary_btn"
                    whileHover={{scale: 1.02}}
                    whileTap={{scale:0.9}}
                    onClick = {()=> {
                        selectedCity ? PageView(selectedCity) : PageView('Homepage')
                        controls.start(close)
                        contentControls.start({opacity: 0, transition: {duration: 0.1}})
                    }}
                >View the map
                </motion.button>
            </motion.div>
        </motion.div>
    )
}

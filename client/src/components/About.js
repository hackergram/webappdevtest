import React, {useEffect, useRef} from 'react'
import {motion, AnimatePresence, useMotionValue} from 'framer-motion'
import close from '../icons/close.svg'
import githublogo from '../icons/github.svg'
import twitterlogo from '../icons/twitterlogo.svg'
import {Event} from "./Tracking"

export function About(props) {
    let {handleAboutClose, desktopSize} = props
    let containerVariants = {
        open: {opacity: 1, transition: {type: 'spring', damping: 16, staggerChildren: 0.2}},
        close: {opacity: 0, transition: {ease: 'easeOut', duration: 1}}
    }
    let contentVariants = {
        open: {opacity: 1, y: 0},
        close: {opacity: 0, y: 50}
    }
    let scrollValue = useMotionValue(0);
    let touchStart = 0;
    let touchEnd = 0;
    const aboutContent = useRef(null);
    useEffect(()=> {
        aboutContent.current.addEventListener('touchstart', function(e){touchStart=e.changedTouches[0].clientY})
        aboutContent.current.addEventListener('touchend', function(e) {
            touchEnd = e.changedTouches[0].clientY;
            if(scrollValue.get() <= 0 && touchEnd > touchStart) {
                touchStart = 0;
                touchEnd = 0;
                handleAboutClose();
            }
        });
    }, [])

    return(
        <AnimatePresence>
            <motion.div
                className = "aboutContainer"
                variants = {containerVariants}
                initial = "close"
                animate = "open"
                exit= "close"
            >
                <motion.div
                    className = "aboutBGscreen"
                    variants = {containerVariants}
                    onClick = {() => handleAboutClose()}
                />
                <motion.div
                    className = "aboutContent"
                    variants = {contentVariants}
                    ref = {aboutContent}
                    onScroll = {(e) => {scrollValue.set(e.nativeEvent.target.scrollTop)}}
                >
                    <div className="aboutContentHeader">
                        <h1>Somethings</h1>
                        <button className="close_btn" onClick={() => handleAboutClose()}><img src={close}  alt="close button" /></button>
                    </div>
                    <div className="aboutContentBody">
                        <p>
                            <span style={{fontWeight: "bold"}}>Yaba Daba Doo! </span>
                          Some stuff!
                                          </p>
                        <a href="https://twitter.com/hackergram" className="aboutCardContainer" target="_blank" onClick={()=> Event("UserAction", "Navigated to Twitter", window.innerWidth > desktopSize ? "DESKTOP": "MOBILE")}>
                            <motion.div
                                className="aboutCard"
                                initial={{scale: 1}}
                                whileHover = {{scale: 1.03}}
                            >
                                <img src={twitterlogo}/>
                                <div>
                                    <p className="smalltext">Reach out to us:</p>
                                    <p className="socialLink">@hackergram</p>
                                </div>
                            </motion.div>
                        </a>
                        <a href="https://github.com/hackergram/webappdevtest" className="aboutCardContainer" target="_blank" onClick={()=> Event("UserAction", "Navigated to Github", window.innerWidth > desktopSize ? "DESKTOP": "MOBILE")}>
                            <motion.div
                                className="aboutCard"
                                initial={{scale: 1}}
                                whileHover = {{scale: 1.03}}
                            >
                                <img src={githublogo}/>
                                <div>
                                    <p className="smalltext">Contribute to the project:</p>
                                    <p className="socialLink">Github Repo</p>
                                </div>
                            </motion.div>
                        </a>
                        <div className="aboutHGcontent">

                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

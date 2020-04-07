import React, {useState, useEffect} from 'react';
import ReactMapGL, {Marker} from 'react-map-gl';
import {motion} from 'framer-motion';
import {PageView } from "./Tracking";

export function MapLayer(props) {

    let clickedOnMarker = false;
    const {onMarkerClick, videoData, totalCities, desktopSize} = props;
    const [viewport, setViewport] = useState({
        latitude: 21.2787,
        longitude: 81.8661,
        width: 'calc(var(--vw, 1vw) * 100)',
        height: 'calc(var(--vh, 1vh) * 100)',
        zoom: (window.innerWidth < desktopSize ? 3 : 4)
    })
    const [mouseDownPoint, setMouseDownPoint] = useState({x: 0, y: 0})
    const [mouseUpPoint, setMouseUpPoint] = useState({x: 0, y: 0})

    const isZoomFriendly = (size) => {
        return (viewport.zoom < 6 && size <= 3) ? false : true;
    }

    useEffect(()=> {
        window.addEventListener('resize', () => {
            let newWidth = window.innerWidth;
            let newHeight = window.innerHeight;
            setViewport(prevState => {return {...prevState, width: newWidth, height: newHeight}});
          });
        window.addEventListener('mousedown', e => setMouseDownPoint({x: e.clientX, y: e.clientY}));
        window.addEventListener('mouseup', e => setMouseUpPoint({x:e.clientX, y:e.clientY}));
    }, [])

    return (
        <div
            onClick = {(e)=> {
                if(!clickedOnMarker &&
                    mouseDownPoint.x === mouseUpPoint.x &&
                    mouseDownPoint.y === mouseUpPoint.y
                    ){
                        onMarkerClick(e, null);
                        clickedOnMarker=false
                    }
                }
            }
        >
        <ReactMapGL
            {...viewport}
            mapboxApiAccessToken={"pk.eyJ1IjoidGhpc2lzYW5vdGhlcnRlc3QiLCJhIjoiY2s4cG9tOXFyMTV5djNrcXpnYmtxZ2hmMCJ9.z-svIPZaBRzZxYBQAjL30g"}
            onViewportChange = {viewport => {setViewport(viewport)}}
            mapStyle="mapbox://styles/thisisanothertest/ck8poooti10i71in24melik54"
        >
            {totalCities.map((city, index) => {
                return (
                    <Marker
                        key={index}
                        latitude = {Number(videoData[city].coordinates.latitude)}
                        longitude = {Number(videoData[city].coordinates.longitude)}
                        offsetLeft={-24}
                        offsetTop={-24}
                    >
                        <button className='marker_btn' onClick={e => {onMarkerClick(e, city); clickedOnMarker=true; PageView(city)}}>
                            <motion.div
                                className="marker_txt"
                                style = {{
                                    width: `calc(1rem + 0.2 * ${String(videoData[city].blocks.length)}rem)`,
                                    height: `calc(1rem + 0.2 * ${String(videoData[city].blocks.length)}rem)`,
                                    lineHeight: `calc(1rem + 0.2 * ${String(videoData[city].blocks.length)}rem)`
                                }}
                                initial = {{scale: 1}}
                                animate= {{scale: 1.05}}
                                transition = {{
                                    yoyo: Infinity,
                                    ease: 'easeOut',
                                    duration: 0.5
                                }}
                                ><p>{isZoomFriendly(videoData[city].blocks.length) && videoData[city].blocks.length}</p>
                            </motion.div>
                            {isZoomFriendly(videoData[city].blocks.length) && <p style={{color: '#fffcf2'}}>{city}</p>}
                        </button>
                    </Marker>
                )})
            }
        </ReactMapGL>
        </div>
    )
}

// STYLES:
// mapbox://styles/kshivanku/ck4o1gm6303131enp3jldbqim

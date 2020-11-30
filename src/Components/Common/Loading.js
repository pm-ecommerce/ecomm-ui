import {CircleLoader} from 'react-spinners';
import React from 'react';

const containerStyle = {
    position : 'fixed',
    left : 0,
    right : 0,
    bottom : 0,
    top : 0,
    margin : 0,
    width : '100%',
    textAlign : 'center',
    height : '100%',
    background : 'rgba(255, 255, 255, 0.8)',
    overflow : 'hidden',
    zIndex : 99,
};
const Loader = ({loading}) => {
    return (
        !loading ? null :
            <div className="sweet-loading" style={ containerStyle }>
                <CircleLoader
                    css={ {marginTop : '10%', margin : '0 auto', top : '40%'} }
                    size={ 150 }
                    color={ '#ff3c20' }
                    loading={ true }
                />
            </div>
    );
};

export default Loader;

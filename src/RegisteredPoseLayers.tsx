import React from 'react';
import {Img, staticFile} from 'remotion';
import type {ResolvedSequenceLayer} from './stateSequence';

// Registered horizontal landmarks keep the head and contact line coincident
// while the two source textures crossfade. Every source pixel stays in a band.
export const RegisteredPoseLayers: React.FC<{
  layers: ResolvedSequenceLayer[];
  bands: Record<string, number[]>;
}> = ({layers, bands}) => {
  const sourceRows = layers.map(layer => bands[layer.id]);
  const total = layers.reduce((sum, layer) => sum + layer.opacity, 0);
  const targetRows = sourceRows[0].map((_, i) =>
    layers.reduce((sum, layer, j) => sum + sourceRows[j][i] * layer.opacity, 0) / total);
  return <div style={{position:'absolute', inset:0, isolation:'isolate'}}>
    {layers.map((layer, index) => <div key={layer.id} style={{position:'absolute', inset:0,
      opacity:layer.opacity, mixBlendMode:'plus-lighter'}}>
      {targetRows.slice(0,-1).map((top, band) => {
        const sourceTop = sourceRows[index][band];
        const sourceHeight = sourceRows[index][band+1] - sourceTop;
        const height = targetRows[band+1] - top;
        return <div key={band} style={{position:'absolute',left:0,width:'100%',
          top:`${top*100}%`,height:`${height*100}%`,overflow:'hidden'}}>
          <Img src={staticFile(layer.src)} style={{position:'absolute',left:0,width:'100%',
            top:`${-sourceTop/sourceHeight*100}%`,height:`${100/sourceHeight}%`,objectFit:'fill'}} />
        </div>;
      })}
    </div>)}
  </div>;
};

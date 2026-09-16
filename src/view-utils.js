export const VIEW_ANGLES={
  '-X':[Math.PI/2,0],
  '+X':[-Math.PI/2,0],
  '-Y':[0,0],
  '+Y':[Math.PI,0],
  '+Z':[0,Math.PI/2],
  '-Z':[0,-Math.PI/2],
  ISO:[-.65,.45]
};

const number=value=>Number(value).toPrecision(6);

export function formatBBoxDimensions(min,max){return['X','Y','Z'].map((axis,index)=>`${axis}: ${number(max[index]-min[index])} (${number(min[index])} : ${number(max[index])})`).join('\n')}

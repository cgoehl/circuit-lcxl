function compare(a: any, b: any): number {
  return a === b
    ? 0
    : a < b
      ? -1
      : 1;
}

export const compareBy = (selector: any) => (a: any, b: any) => compare(selector(a), selector(b));

export const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const range = (count: number) => Array.from(new Array(count)).map((_ , i) => i);

export interface IPoint2 {
	x: number;
	y: number;
}

export interface IPolar {
	r: number;
	phi: number;
}

export const polarToCartesian = (polar: IPolar) => ({
	x: polar.r * Math.cos(polar.phi),
	y: polar.r * Math.sin(polar.phi),
});

export const cartesianToPolar = (cartesian: IPoint2) => ({ 
	r: Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y),
	phi: Math.atan2(cartesian.y, cartesian.x),
});

export const degToRad = (deg: number): number => deg / 180 * Math.PI;
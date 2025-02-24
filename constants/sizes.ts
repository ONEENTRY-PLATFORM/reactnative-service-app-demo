import { Dimensions } from "react-native";

export const ROUNDED_RADIUS = 99999999;
export const layoutPadding = 13;
export const paddingX = 20;

export const screenWidth = Dimensions.get('window').width;
export const layoutWidth = Dimensions.get('window').width - layoutPadding * 2;
export const proportionX = Dimensions.get('window').width / 393;
export const layoutHeight = Dimensions.get('window').height;

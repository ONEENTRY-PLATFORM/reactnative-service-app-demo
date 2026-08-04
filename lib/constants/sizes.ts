import {Dimensions} from 'react-native';

export const layoutPadding = 13;

export const screenWidth = Dimensions.get('window').width;
export const layoutWidth = Dimensions.get('window').width - layoutPadding * 2;
export const proportionX = Dimensions.get('window').width / 393;
export const layoutHeight = Dimensions.get('window').height;

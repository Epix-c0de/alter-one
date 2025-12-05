try {
    console.log('Requiring expo/metro-config...');
    const { getDefaultConfig } = require('expo/metro-config');
    console.log('Success.');

    console.log('Requiring @rork-ai/toolkit-sdk/metro...');
    const { withRorkMetro } = require('@rork-ai/toolkit-sdk/metro');
    console.log('Success.');

    console.log('Requiring nativewind/metro...');
    const { withNativeWind } = require('nativewind/metro');
    console.log('Success.');

    console.log('Getting default config...');
    const config = getDefaultConfig(__dirname);
    console.log('Success.');

    console.log('Applying withRorkMetro...');
    const rorkConfig = withRorkMetro(config);
    console.log('Success.');

    console.log('Applying withNativeWind...');
    const finalConfig = withNativeWind(rorkConfig, { input: './app/index.css' });
    console.log('Success. Final config generated.');
} catch (error) {
    console.error('Error:', error);
    if (error.stack) console.error(error.stack);
}

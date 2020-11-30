const utils = {
    getCustomization : (attributes) => {
        const customization = [];
        for (const attribute of attributes) {
            customization.push(attribute.name + ' : ' + attribute.option.name);
        }

        return customization.join(' | ');
    }
};

export default utils;

const category = (state = [], action) => {
    switch (action.type) {
        case 'CATEGORIES_RECOVERED':
            return [
                ...state,
                ...action.data
            ];

        default:
            return state;
    }
};

export default category;

import './index.scss'

function BurgerButton({ isActive, ...props }) {
    return (
        <button
            className={`burgerBtn ${isActive && 'is-active'}`}
            aria-label='open menu'
            title='open menu'
            {...props}
        >
            <span className='burgerBtn__line'></span>
            <span className='burgerBtn__line'></span>
            <span className='burgerBtn__line'></span>
        </button>
    )
};

export { BurgerButton };
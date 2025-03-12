'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BurgerButton } from '@/components/BurgerButton';
import { useState } from 'react';

import './index.scss'

function Header() {
    const [open, setOpen] = useState(false)

    return (
        <header className='header'>
            <BurgerButton isActive={open} onClick={() => setOpen(prev => !prev)} />

            <Link className='header__logo' href='/' title='home' aria-label='home'>
                <Image className='header__logoImg' src='/logo.svg' width='40' height='34' alt='' />
                <span className='header__title'>KG Map</span>
            </Link>

            <div className={`header__overlay ${open && 'is-active'}`}>
                <nav className='header__menu'>
                    <ul className='header__menuList'>
                        <li className='header__menuItem'>
                            <Link className='header__menuLink' href='/'>Поиск</Link>
                        </li>
                        <li className='header__menuItem'>
                            <Link className='header__menuLink' href='/'>Глоссарий</Link>
                        </li>
                        <li className='header__menuItem'>
                            <Link className='header__menuLink' href='/'>Карта</Link>
                        </li>
                        <li className='header__menuItem'>
                            <Link className='header__menuLink' href='/'>Блог</Link>
                        </li>
                        <li className='header__menuItem'>
                            <Link className='header__menuLink' href='/'>О проекте</Link>
                        </li>
                    </ul>
                </nav>
                <div className='header__overlay-bg'></div>
            </div>
        </header>
    )
};

export { Header };
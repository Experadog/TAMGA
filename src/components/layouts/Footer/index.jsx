import Link from 'next/link';

import './index.scss';

function Footer() {
    return (
        <footer className='footer'>
            <div className="footer__body">
                <div className="footer__logo">
                    <span className='footer__title'>Logo</span>
                    <hr className='footer__hr' />
                </div>
                <div className="footer__content">
                    <div className="footer__column">
                        <Link href='/' className='footer__column-main-link'>About Neuros</Link>
                        <ul className='footer__column-list'>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Company Overview</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Careers</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Press & Media</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Testimonials</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer__column">
                        <Link href='/' className='footer__column-main-link'>Support & Contact</Link>
                        <ul className='footer__column-list'>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Contact Us</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Technical Support</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Feedback</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Community Forum</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer__column">
                        <Link href='/' className='footer__column-main-link'>Connect</Link>
                        <ul className='footer__column-list'>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Instagram</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Facebook</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Twitter / X</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>Linkedin</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer__extra">
                <span className='footer__copyright'>©2025 Logo · All rights reserved.</span>
                <ul className='footer__extra-list'>
                    <li className='footer__extra-item'>
                        <Link className='footer__extra-link' href='/'>Term of use</Link>
                    </li>
                    <li className='footer__extra-item'>
                        <Link className='footer__extra-link' href='/'>Privacy policy</Link>
                    </li>
                    <li className='footer__extra-item'>
                        <Link className='footer__extra-link' href='/'>Security</Link>
                    </li>
                </ul>
            </div>
        </footer>
    )
};

export { Footer };
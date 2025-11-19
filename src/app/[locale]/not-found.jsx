import fifth from "@/assets/icons/fifthIcon.svg";
import first from "@/assets/icons/firstIcon.svg";
import fourth from "@/assets/icons/fourthIcon.svg";
import second from "@/assets/icons/secondIcon.svg";
import seventh from "@/assets/icons/seventhIcon.svg";
import sixth from "@/assets/icons/sixthIcon.svg";
import third from "@/assets/icons/thirdIcon.svg";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import cls from "./notFound.module.scss";

export default function NotFoundPage() {

    return (
        <div className={`full-width-page ${cls.notFound}`}>
            <div className={cls.notFound__container}>
                <Image className={cls.iconAbs1} src={first} alt="icon" width={56} height={56} />
                <Image className={cls.iconAbs2} src={second} alt="icon" width={38} height={38} />
                <Image className={cls.iconAbs3} src={third} alt="icon" width={44} height={44} />
                <Image className={cls.iconAbs4} src={fourth} alt="icon" width={44} height={44} />
                <Image className={cls.iconAbs5} src={fifth} alt="icon" width={55} height={55} />
                <Image className={cls.iconAbs6} src={sixth} alt="icon" width={44} height={44} />
                <Image className={cls.iconAbs7} src={seventh} alt="icon" width={54} height={54} />
                <div className={cls.notFound__content}>
                    <p className={cls.page}>Страница не найдена</p>
                    <h1 className={cls.header404}>404</h1>
                    <p className={cls.text}>Кажется, вы заблудились. Давайте вернёмся назад или на главную! 🏠</p>
                    <Link className={cls.btnLink} href={`/`}>
                        На главную
                    </Link>
                </div>
            </div>
        </div>
    );
}
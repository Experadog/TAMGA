'use client';

import sendIcon from '@/assets/icons/send-icon.svg';
import successIcon from '@/assets/icons/success-icon.svg';
import { Link } from '@/i18n/navigation';
import useRecaptcha from '@/lib/hooks/useRecaptcha';
import useRequestFormDictionaries from '@/lib/hooks/useRequestFormDictionaries';
import { getLocalizedValue } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import FieldWrapper from '../FieldWrapper/FieldWrapper';
import SelectField from '../SelectField/SelectField';
import styles from './RequestFormModal.module.scss';

const INITIAL_FORM_STATE = {
  name: '',
  region: 0,
  district: 0,
  terms_topomyns: 0,
  general_info: '',
  document_mentions: '',
  origin: '',
  cultural_info: '',
  literature_list: '',
  author: '',
};

export default function RequestFormModal({ buttonLabel, toponym }) {
  const locale = useLocale();
  const t = useTranslations('form');

  const [isOpen, setIsOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  // ХУКИ
  const {
    recaptchaRef,
    captchaToken,
    errors: captchaErrors,
    initRecaptcha,
    resetRecaptcha,
  } = useRecaptcha({ locale, t });

  const {
    terms,
    regions,
    districts,
    loadDistricts,
  } = useRequestFormDictionaries(isOpen);

  const captchaMessage = errors.captcha || captchaErrors;

  useEffect(() => {
    if (!isOpen || !toponym) return;

    const auto = {
      name: getLocalizedValue(toponym, 'name', locale) || '',
      terms_topomyns: toponym.terms_topomyns?.id || 0,
      region: toponym.region?.[0]?.id || 0,
      district: toponym.district?.[0]?.id || 0,
    };

    if (auto.region) {
      loadDistricts(auto.region);
    }

    setForm(prev => ({
      ...prev,
      ...auto
    }));
  }, [isOpen, toponym]);

  // Блокировка скролла
  useEffect(() => {
    if (!isOpen && !isSuccessOpen) return;
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = '');
  }, [isOpen, isSuccessOpen]);

  // Рендерим Recaptcha при открытии
  useEffect(() => {
    if (isOpen) initRecaptcha();
  }, [isOpen, initRecaptcha]);


  const change = (field) => (e) => {
    const value = e.target.value;
    const isNum = ['region', 'district', 'terms_topomyns'].includes(field);

    const nextValue = isNum ? Number(value) || 0 : value;

    setForm(prev => ({
      ...prev,
      [field]: nextValue,
    }));

    if (field === 'region') {
      loadDistricts(Number(value) || 0);
    }
  };

  const validate = () => {
    const reqFields = [
      'name',
      'terms_topomyns',
      'region',
      'district',
      'general_info',
      'origin',
      'literature_list',
      'author',
    ];

    const numericFields = [
      'terms_topomyns',
      'region',
      'district',
    ];

    const next = {};

    reqFields.forEach((key) => {
      if (numericFields.includes(key)) {
        if (!form[key]) {
          next[key] = t('required.field');
        }
      } else {
        if (!String(form[key] ?? '').trim()) {
          next[key] = t('required.field');
        }
      }
    });

    if (!captchaToken) {
      next.captcha = t('robot');
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        recaptcha: captchaToken,
        ...(toponym?.id ? { toponym: toponym.id } : {})
      };

      const resp = await fetch('https://api.tamga.kg/api/v1/toponyms/request-users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error();

      setForm(INITIAL_FORM_STATE);
      setErrors({});
      resetRecaptcha();
      setIsOpen(false);
      setIsSuccessOpen(true);
    } catch (e) {
      alert(t('error.repeat'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderName = (item) =>
    getLocalizedValue(item, 'name', locale) ||
    item?.name_ru ||
    item?.name_ky ||
    item?.name_en ||
    '';

  const cancel = () => {
    setForm(INITIAL_FORM_STATE);
    setErrors({});
    resetRecaptcha();
    setIsOpen(false);
  };

  return (
    <>
      {/* кнопка-триггер */}
      <button
        type="button"
        className={styles.button}
        onClick={() => setIsOpen(true)}
      >
        {buttonLabel}
      </button>

      {/* основная модалка с формой */}
      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t('content.fill')}</h3>
              <p className={styles.modalSubtitle}>
                {t('content.every-one')}
              </p>
            </div>

            <form className={styles.modalForm} onSubmit={submit}>
              <div className={styles.modalGrid}>
                <FieldWrapper label={t('content.object-name')} required error={errors.name}>
                  <input
                    className={styles.input}
                    type="text"
                    value={form.name}
                    onChange={change('name')}
                    placeholder={t('content.object-fill')}
                  />
                </FieldWrapper>

                <FieldWrapper label={t('content.object-type')} required error={errors.terms_topomyns}>
                  <SelectField
                    value={form.terms_topomyns || ''}
                    onChange={change('terms_topomyns')}
                  >
                    <option value="">{t('content.object-enter')}</option>
                    {terms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {renderName(term)}
                      </option>
                    ))}
                  </SelectField>
                </FieldWrapper>

                <FieldWrapper label={t('content.region')} required error={errors.region}>
                  <SelectField
                    value={form.region || ''}
                    onChange={change('region')}
                  >
                    <option value="">{t('content.region-enter')}</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {renderName(region)}
                      </option>
                    ))}
                  </SelectField>
                </FieldWrapper>

                <FieldWrapper label={t('content.district')} required error={errors.district}>
                  <SelectField
                    value={form.district || ''}
                    onChange={change('district')}
                  >
                    <option value="">{t('content.district-enter')}</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {renderName(district)}
                      </option>
                    ))}
                  </SelectField>
                </FieldWrapper>
              </div>

              <FieldWrapper
                label={t('content.general-info')}
                required
                error={errors.general_info}
              >
                <textarea
                  className={styles.textarea}
                  value={form.general_info}
                  onChange={change('general_info')}
                  placeholder={t('content.general-enter')}
                />
              </FieldWrapper>

              <FieldWrapper label={t('content.in-document')}>
                <input
                  className={styles.input}
                  type="text"
                  value={form.document_mentions}
                  onChange={change('document_mentions')}
                  placeholder={t('content.in-document-enter')}
                />
              </FieldWrapper>

              <FieldWrapper
                label={t('content.origin')}
                required
                error={errors.origin}
              >
                <input
                  className={styles.input}
                  type="text"
                  value={form.origin}
                  onChange={change('origin')}
                  placeholder={t('content.origin-enter')}
                />
              </FieldWrapper>

              <FieldWrapper label={t('content.history')}>
                <input
                  className={styles.input}
                  type="text"
                  value={form.cultural_info}
                  onChange={change('cultural_info')}
                  placeholder={t('content.history-enter')}
                />
              </FieldWrapper>

              <FieldWrapper
                label={t('content.books')}
                required
                error={errors.literature_list}
              >
                <input
                  className={styles.input}
                  type="text"
                  value={form.literature_list}
                  onChange={change('literature_list')}
                  placeholder={t('content.books-enter')}
                />
              </FieldWrapper>

              <FieldWrapper
                label={t('content.author')}
                required
                error={errors.author}
              >
                <input
                  className={styles.input}
                  type="text"
                  value={form.author}
                  onChange={change('author')}
                  placeholder={t('content.author-enter')}
                />
              </FieldWrapper>

              <div className={styles.downBlock}>
                <div className={styles.captchaPlaceholder}>
                  <div ref={recaptchaRef} className={styles.recaptchaBox} />
                  {captchaMessage && (
                    <div className={styles.fieldError}>{captchaMessage}</div>
                  )}
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={cancel}
                    disabled={isSubmitting}
                  >
                    {t('content.cancel')}
                  </button>
                  <button
                    type="submit"
                    className={`${styles.primaryButton} ${styles.flexButton}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('content.sending') : t('content.send')}
                    <Image src={sendIcon} alt='send' width={20} height={20} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка успеха */}
      {isSuccessOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.successModal}>
            <div className={styles.successIcon}>
              <Image src={successIcon} alt='success' width={93} height={93} />
            </div>
            <h3 className={styles.successTitle}>{t('content.done')}</h3>
            <p className={styles.successText}>
              {t('content.success')}
            </p>
            <Link
              href={`/`}
              className={styles.primaryButton}
              onClick={() => setIsSuccessOpen(false)}
            >
              {t('content.back-home')}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
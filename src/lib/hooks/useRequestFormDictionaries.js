'use client';

import { useEffect, useState } from 'react';

export default function useRequestFormDictionaries(isOpen) {
  const [terms, setTerms] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Загружаем terms + regions
  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      try {
        const [termsRes, regionsRes] = await Promise.all([
          fetch('https://api.tamga.kg/api/v1/directories/terms-topomyns/'),
          fetch('https://api.tamga.kg/api/v1/territories/regions/'),
        ]);

        const [termsJson, regionsJson] = await Promise.all([
          termsRes.json(),
          regionsRes.json(),
        ]);

        setTerms(termsJson?.results || []);
        setRegions(regionsJson?.results || []);
        setDistricts([]);
      } catch (e) {
        console.error('Error loading dictionaries:', e);
      }
    };

    load();
  }, [isOpen]);

  // Загрузка районов
  const loadDistricts = async (regionId) => {
    if (!regionId) {
      setDistricts([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.tamga.kg/api/v1/territories/districts/?region=${regionId}`
      );
      const json = await res.json();
      setDistricts(json?.results || []);
    } catch (e) {
      console.error('Error loading districts:', e);
      setDistricts([]);
    }
  };

  return {
    terms,
    regions,
    districts,
    loadDistricts,
  };
}
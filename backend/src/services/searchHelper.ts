import pinyinLib from 'pinyin';

const pinyin = pinyinLib.default || pinyinLib;

function removeTone(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export class SearchHelper {
  static getPinyinInitials(str: string): string {
    if (!str) return '';
    const result = pinyin(str, {
      style: 'first',
      heteronym: false,
    });
    return result
      .map(item => removeTone(item[0]?.[0] || '').toUpperCase())
      .join('');
  }

  static getFullPinyin(str: string): string {
    if (!str) return '';
    const result = pinyin(str, {
      style: 'normal',
      heteronym: false,
    });
    return result.flat().join('').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  static matchesSearch(text: string, keyword: string): boolean {
    if (!text || !keyword) return true;

    const upperKeyword = keyword.toUpperCase();
    const upperText = text.toUpperCase();

    if (upperText.includes(upperKeyword)) {
      return true;
    }

    const initials = this.getPinyinInitials(text);
    if (initials.includes(upperKeyword)) {
      return true;
    }

    const fullPinyin = this.getFullPinyin(text);
    if (fullPinyin.includes(upperKeyword)) {
      return true;
    }

    return false;
  }

  static matchesSearchV2(
    companyName: string,
    stockCode: string,
    keyword: string
  ): boolean {
    if (!keyword) return true;

    const upperKeyword = keyword.toUpperCase();

    if (stockCode.toUpperCase().includes(upperKeyword)) {
      return true;
    }

    if (companyName.toUpperCase().includes(upperKeyword)) {
      return true;
    }

    const nameInitials = this.getPinyinInitials(companyName);
    if (nameInitials.includes(upperKeyword)) {
      return true;
    }

    const nameFullPinyin = this.getFullPinyin(companyName);
    if (nameFullPinyin.includes(upperKeyword)) {
      return true;
    }

    return false;
  }
}

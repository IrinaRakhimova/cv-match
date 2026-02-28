import React, { useMemo } from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  minTextLength: number;
  maxTextLength: number;
}

const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const TextArea: React.FC<TextAreaProps> = ({
  name,
  value,
  onChange,
  minTextLength = 50,
  maxTextLength,
}) => {

  const textLength = value.length;
  const wordsCount = useMemo(() => countWords(value), [value]);
  const textTrimmed = value.trim();

  const lengthWarning = textLength > maxTextLength * 0.9;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxTextLength) {
      onChange(newValue);
    }
  };

  return (
    <>
      <label className={`${styles.fieldLabel}`} htmlFor={name}>
        <span>{name}</span>
      </label>

      {textTrimmed.length > 0 && textTrimmed.length < minTextLength && (
        <div className={styles.validationError}>
          {name} must be at least {minTextLength} characters ({textTrimmed.length} / {minTextLength})
        </div>
      )}

      <div className={styles.textareaWrapper}>
        <textarea
          className={`${styles.textarea} 
            ${lengthWarning ? styles.textareaWarning : ''} 
            ${textLength > maxTextLength ? styles.textareaError : ''}`}
          placeholder={`Paste your ${name.toLowerCase()} here...`}
          value={value}
          onChange={handleChange}
          maxLength={maxTextLength}
          rows={8}
          id={name}
        />

        <span
          className={`${styles.charCount} ${styles.charCountBottom} 
          ${lengthWarning ? styles.charCountWarning : ''} 
          ${textLength > maxTextLength ? styles.charCountError : ''}`}
        >
          {textLength.toLocaleString()} / {maxTextLength.toLocaleString()}
          {wordsCount > 0 && ` • ${wordsCount.toLocaleString()} words`}
        </span>
      </div>
    </>
  );
};
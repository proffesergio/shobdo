'use client';

import { useEffect, useRef, useState } from 'react';
import { ApiStatus } from './api-status';

const DRAFT_KEY = 'shobdo:draft:v1';
const LIMIT = 12000;
const bn = new Intl.NumberFormat('bn-BD');
const initialText = 'প্রতিটি গল্পের শুরু হয় একটি ভাবনা থেকে।\n\nআপনার ভাবনাকে শব্দে সাজান। নিজের ভাষায়, নিজের মতো করে।';
type Draft = { version: 1; title: string; text: string };

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<Draft>;
  return draft.version === 1 && typeof draft.title === 'string' && draft.title.length <= 100
    && typeof draft.text === 'string' && draft.text.length <= LIMIT;
}

function Mark({ small = false }: { small?: boolean }) {
  return <span className={`sound-mark${small ? ' small' : ''}`} aria-hidden="true"><i /><i /><i /><i /><i /></span>;
}

export function Studio() {
  const [title, setTitle] = useState('আমার প্রথম গল্প');
  const [text, setText] = useState(initialText);
  const [persist, setPersist] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');
  const textRef = useRef<HTMLTextAreaElement>(null);
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (stored) {
        const draft: unknown = JSON.parse(stored);
        if (isDraft(draft)) {
          setTitle(draft.title);
          setText(draft.text);
          setPersist(true);
        } else {
          setStorageBlocked(true);
          setSaveStatus('আগের খসড়াটি পড়া যায়নি। সেটি বদলানো হয়নি।');
        }
      }
    } catch {
      setStorageBlocked(true);
      setSaveStatus('ব্রাউজারের সংরক্ষণ ব্যবহার করা যাচ্ছে না। লেখা ডাউনলোড করে রাখুন।');
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || !persist || storageBlocked) return;
    setSaveStatus('সংরক্ষণ হচ্ছে…');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, title, text } satisfies Draft));
        setSaveStatus('এই ব্রাউজারে সংরক্ষিত');
      } catch {
        setStorageBlocked(true);
        setSaveStatus('সংরক্ষণ হয়নি। লেখা ডাউনলোড করে রাখুন।');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [loaded, persist, storageBlocked, title, text]);

  useEffect(() => {
    if (persist && !storageBlocked && saveStatus === 'এই ব্রাউজারে সংরক্ষিত') return;
    if (text === initialText && title === 'আমার প্রথম গল্প') return;
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ''; }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [text, title, persist, storageBlocked, saveStatus]);

  function togglePersistence(enabled: boolean) {
    if (!enabled) {
      setPersist(false);
      try {
        localStorage.removeItem(DRAFT_KEY);
        setSaveStatus('ব্রাউজারে রাখা কপি মুছে ফেলা হয়েছে।');
      } catch {
        setStorageBlocked(true);
        setSaveStatus('ব্রাউজারে রাখা কপি মোছা যায়নি। ব্রাউজারের সাইট ডেটা থেকে মুছুন।');
      }
    } else setPersist(true);
  }

  function download() {
    let url: string | undefined;
    const anchor = document.createElement('a');
    try {
      const file = new Blob(['\uFEFF', title.trim(), '\r\n\r\n', text], { type: 'text/plain;charset=utf-8' });
      url = URL.createObjectURL(file);
      anchor.href = url;
      anchor.download = 'shobdo-draft.txt';
      document.body.append(anchor);
      anchor.click();
      setDownloadStatus('লেখার ডাউনলোড অনুরোধ পাঠানো হয়েছে।');
    } catch {
      setDownloadStatus('ডাউনলোড শুরু করা যায়নি। লেখাটি কপি করে রাখুন।');
    } finally {
      anchor.remove();
      if (url) {
        const objectUrl = url;
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }
    }
  }

  return <div className="app-shell">
    <a className="skip-link" href="#workspace">মূল লেখায় যান</a>
    <aside className="sidebar" aria-label="স্টুডিও নেভিগেশন">
      <a className="brand" href="/" aria-label="শব্দ হোম"><Mark /><span>শব্দ<small>BHASHA LABS</small></span></a>
      <div className="workspace-label">আপনার সৃজনশীল জায়গা</div>
      <nav aria-label="কর্মক্ষেত্র">
        <a className="nav-link active" href="#workspace" aria-current="page"><span aria-hidden="true">▤</span> লেখার স্টুডিও <span className="nav-arrow" aria-hidden="true">↗</span></a>
        <a className="nav-link" href="#voice"><span aria-hidden="true">♫</span> কণ্ঠ ও অডিও <span className="soon">শীঘ্রই</span></a>
        <a className="nav-link" href="#privacy"><span aria-hidden="true">◇</span> খসড়া ও গোপনীয়তা</a>
      </nav>
      <div className="sidebar-note"><span className="mini-label">BUILT FOR BANGLA</span><h2>আপনার ভাষা।<br />আপনার পরিচয়।</h2><p>ভাবনা থেকে প্রকাশ, বাংলাতেই হোক শুরু।</p><Mark small /></div>
      <div className="sidebar-footer"><span className="avatar" aria-hidden="true">অ</span><div>স্থানীয় কর্মক্ষেত্র<small>অ্যাকাউন্ট সংযুক্ত নয়</small></div></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div>কর্মক্ষেত্র <span aria-hidden="true">/</span> <strong>লেখার স্টুডিও</strong></div><span className="preview-badge"><span /> প্রাথমিক সংস্করণ</span></header>
      <main id="workspace" tabIndex={-1}>
        <section className="welcome"><div><p className="eyebrow">ভাবনা আপনার, শব্দও আপনার</p><h1>গল্পটা শুরু হোক এখানেই<span>।</span></h1><p>লিখুন, গুছিয়ে নিন, আর আপনার পরের ভিডিওর জন্য প্রস্তুত রাখুন।</p></div><span className="edition" lang="en">CREATOR STUDIO <b>01 / BN</b></span></section>
        <div className="studio-grid">
          <section className="editor-card" aria-labelledby="editor-heading">
            <div className="card-header"><h2 id="editor-heading"><span className="step-number">০১</span> আপনার স্ক্রিপ্ট</h2><span className="subtle">লেখার খসড়া</span></div>
            <div className="editor-body">
              <label className="field-label" htmlFor="draft-title">গল্পের নাম</label>
              <input id="draft-title" className="title-input" value={title} disabled={!loaded} maxLength={100} onChange={event => setTitle(event.target.value)} autoComplete="off" />
              <div className="editor-divider" />
              <label className="field-label" htmlFor="draft-text">স্ক্রিপ্টের লেখা</label>
              <textarea ref={textRef} id="draft-text" value={text} disabled={!loaded} maxLength={LIMIT} onChange={event => setText(event.target.value)} placeholder="আপনার গল্পটি এখানে লিখুন…" aria-describedby="editor-limit" spellCheck />
            </div>
            <div className="editor-footer"><span>{bn.format(words)} শব্দ</span><span id="editor-limit" role="status">{text.length === LIMIT ? 'এই খসড়ার সীমা পূর্ণ হয়েছে।' : 'দীর্ঘ স্ক্রিপ্ট কয়েকটি অংশে লিখুন।'}</span></div>
            <div className="editor-actions"><p>বাংলা ও ইংরেজি মিলিয়েও লিখতে পারেন।</p><button type="button" className="button primary" onClick={download} disabled={!text.trim()}><span aria-hidden="true">↓</span> লেখা ডাউনলোড <span className="file-type" lang="en">.TXT</span></button></div>
            <p className="sr-only" role="status">{downloadStatus}</p>
          </section>
          <aside className="voice-card" id="voice" aria-labelledby="voice-heading">
            <div className="card-header"><h2 id="voice-heading"><span className="step-number">০২</span> কণ্ঠের প্রস্তুতি</h2></div>
            <div className="voice-illustration" aria-hidden="true"><div className="voice-ring"><Mark /></div><span className="voice-tag">বাংলার নিজস্ব স্বর</span></div>
            <div className="voice-content"><span className="development-label">উন্নয়নাধীন</span><h3>লেখা পাবে কণ্ঠ।</h3><p>বাংলা অডিও এবং নিজের কণ্ঠে বলার সুবিধা নিয়ে কাজ হবে পরবর্তী ধাপে। এখন আপনার স্ক্রিপ্ট লিখে রাখুন।</p>
              <dl className="availability"><div><dt>টেক্সট থেকে অডিও</dt><dd>এখনো চালু হয়নি</dd></div><div><dt>নিজের কণ্ঠ</dt><dd>এখনো চালু হয়নি</dd></div></dl>
              <button type="button" className="button unavailable" disabled aria-describedby="audio-unavailable">অডিও তৈরি <span aria-hidden="true">→</span></button><p id="audio-unavailable" className="help-text">অডিও তৈরি ও ডাউনলোড এখন উপলব্ধ নয়।</p>
            </div>
          </aside>
        </div>
        <div className="below-grid">
          <section id="privacy" className="privacy-card" aria-labelledby="privacy-heading"><div className="section-icon" aria-hidden="true">◇</div><div><h2 id="privacy-heading">খসড়া থাকুক আপনার নিয়ন্ত্রণে</h2><p>এই লেখা সার্ভারে পাঠানো হয় না। চাইলে এই ব্রাউজারে সংরক্ষণ করুন। শেয়ার করা কম্পিউটারে সংরক্ষণ এড়িয়ে চলুন।</p><label className="storage-toggle"><input type="checkbox" checked={persist} disabled={!loaded || storageBlocked} onChange={event => togglePersistence(event.target.checked)} /> এই ব্রাউজারে খসড়া রাখুন</label><p role="status" className="save-status">{saveStatus || 'সংরক্ষণ বন্ধ আছে। পাতা বন্ধ করার আগে লেখা ডাউনলোড করুন।'}</p></div></section>
          <section className="tip-card"><span className="mini-label">একটু অনুপ্রেরণা</span><h2>প্রথম লাইনেই মনোযোগ টানুন।</h2><p>একটি প্রশ্ন, একটি অভিজ্ঞতা, কিংবা অজানা তথ্য দিয়ে আপনার ভিডিওর গল্প শুরু করুন।</p><button type="button" className="text-button" onClick={() => textRef.current?.focus()}>লেখায় ফিরে যান <span aria-hidden="true">↗</span></button></section>
        </div>
        <footer className="page-footer"><span>শব্দ <span aria-hidden="true">·</span> বাংলায় সৃষ্টির নতুন অধ্যায়</span><ApiStatus /></footer>
      </main>
    </div>
  </div>;
}

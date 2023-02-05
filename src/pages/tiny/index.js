/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { Component, useState, useEffect } from 'react';
// import ReactDom from 'react-dom';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './normalize.scss';
import './tiny.scss';
import { addStyle, genCustomConsole } from 'mazey';

const TinyLog = genCustomConsole('TinyLog:', { showDate: true });
const domain = 'https://mazey.cn';
const Tiny = () => {
  const [ori_link, setOriLink] = useState('');
  const [tiny_link, setTinyLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [backupTinyLink, setBackupTinyLink] = useState('');

  useEffect(() => {
    TinyLog.log('tiny');
    // 标记
    localStorage.setItem('mazey_loaded_tiny', '1');
  }, []);

  const getTinyLink = (oriLink) => {
    return axios.post('https://feperf.com/api/gee/generate-short-link', {
      ori_link: oriLink,
    })
      .then(res => {
        TinyLog.log('Tiny Link', res.data.tiny_link);
        return res.data.tiny_link;
      });
  };

  const hashCodeToLink = hashCode => {
    if (typeof hashCode === 'string' && hashCode.length <= 4) {
      const link = `https://mazey.cn/t/${hashCode}`;
      TinyLog.log('link', link);
      window.open(link);
    }
  };

  const fetchShortLink = async () => {
    let real_ori_link = ori_link;
    if (!ori_link.includes('http')) {
      hashCodeToLink(real_ori_link);
      real_ori_link = `http://${ori_link}`;
    }
    // TinyLog.log('real_ori_link', real_ori_link)
    axios.post(`${domain}/server/generate/short-link`, {
      ori_link: real_ori_link,
    }).then(res => {
      // TinyLog.log('fetchShortLink', res)
      const { data: { data: { tiny_link } } } = res;
      setTinyLink(tiny_link);
      setCopied(false);
    });
    // Backup
    const backupTinyLink = await getTinyLink(real_ori_link);
    TinyLog.log('Backup Tiny Link', backupTinyLink);
    if (backupTinyLink) {
      setBackupTinyLink(backupTinyLink);
    }
  };

  const inputChange = ({ target: { value: ori_link } }) => {
    // TinyLog.log('inputChange', ori_link)   npm i react react-copy-to-clipboard react-dom --save
    setOriLink(ori_link);
  };

  return (
    <div className='tiny-box'>
      <div className='generate'>
        <input value={ori_link} onChange={inputChange} placeholder='请输入长链接' autoFocus />
        <button type='button' onClick={fetchShortLink}>生成</button>
      </div>
      <div className='result-show'>
        {/* 短链接 */}
        {
          tiny_link && <input value={tiny_link} placeholder='请复制短链接' onChange={() => {}} />
        }
        {/* 复制按钮 */}
        {
          tiny_link
            ? <CopyToClipboard onCopy={() => setCopied(true)} text={tiny_link}>
              <button>复制</button>
            </CopyToClipboard>
            : ''
        }
        {/* 提示 */}
        {
          copied ? <span className='copied'>已复制</span> : ''
        }
        {
          !tiny_link ? <span className='placeholder'>生成的短链接~</span> : ''
        }
      </div>
      {
        backupTinyLink
          ? <div className='generated-result'>
            <span>备用链接：</span>
            <a href={backupTinyLink} target='_blank' title='备用链接'>{backupTinyLink}</a>
          </div>
          : ''
      }
    </div>
  );
};

// Example: TinyInit('#tiny-box', { isGrayBackground: true });
const TinyInit = (selector = '', options = {
  isGrayBackground: false,
}) => {
  if (!selector) {
    return;
  }
  const { isGrayBackground } = options;
  const container = document.querySelector(selector);

  if (container) {
    // ReactDom.render(<Tiny />, container);
    const root = createRoot(container);
    root.render(<Tiny />);

    if (isGrayBackground) {
      addStyle(
        `
          #tiny-box {
            background-color: #eee;
            border-radius: 4px;
          }
        `
      );
    }
  }
};

// TinyInit('#tiny-box');
TinyInit('#tiny-box', { isGrayBackground: true });

window.TINY_INIT = TinyInit;

// ReactDom.render(<Tiny />, document.getElementById('tiny-box'));

/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { Component, useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import axios from 'axios';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './tiny.scss';
import { addStyle } from 'mazey';

const domain = 'https://mazey.cn';
const Tiny = () => {
  const [ori_link, setOriLink] = useState('');
  const [tiny_link, setTinyLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log('tiny');
    // 标记
    localStorage.setItem('mazey_loaded_tiny', '1');
  }, []);

  const fetchShortLink = () => {
    let real_ori_link = ori_link;
    if (!ori_link.includes('http')) {
      real_ori_link = `http://${ori_link}`;
    }
    // console.log('real_ori_link', real_ori_link)
    axios.post(`${domain}/server/generate/short-link`, {
      ori_link: real_ori_link,
    }).then(res => {
      // console.log('fetchShortLink', res)
      const { data: { data: { tiny_link } } } = res;
      setTinyLink(tiny_link);
      setCopied(false);
    });
  };

  const inputChange = ({ target: { value: ori_link } }) => {
    // console.log('inputChange', ori_link)   npm i react react-copy-to-clipboard react-dom --save
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
      </div>
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
    ReactDom.render(<Tiny />, container);

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

TinyInit('#tiny-box');

window.TINY_INIT = TinyInit;

// ReactDom.render(<Tiny />, document.getElementById('tiny-box'));

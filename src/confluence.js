/* eslint-disable no-undef */
import { formatDate, getCookie, isNonEmptyArray, genCustomConsole, setImgWidHeiBySrc } from 'mazey';
// import { setImgWidthHeight } from 'mazey-wordpress-utils';

const ConCon = genCustomConsole('Confluence:');

ConCon.log('loaded');

// Area: `.wiki-content`
const realjQuery = window.jQuery || window.$;
if (realjQuery) {
  const $ = realjQuery;
  // Format
  $('.wiki-content>p>br').hide();
  // Table
  $('.wiki-content td.confluenceTd>a').after('<br />');
  // WP .entry-content td
  $('.entry-content td>a').after('<br />');
  // Record
  let userName, zhUserName;
  const enUserName = getCookie('username') || 'unknown';
  const zhUserNameDom = $('#user-menu-link');
  if (zhUserNameDom.length) {
    zhUserName = zhUserNameDom.attr('title');
  }
  if (zhUserName) {
    userName = `${zhUserName}/${enUserName}`;
  } else {
    userName = enUserName;
  }
  let pageTitle = document.title;
  if (typeof pageTitle === 'string' && pageTitle.length) {
    const titleArr = pageTitle.split('-');
    if (isNonEmptyArray(titleArr)) {
      pageTitle = titleArr[0];
    }
  }
  const settings = {
    url: 'https://i.mazey.net/server/log/add',
    method: 'POST',
    timeout: 0,
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      log_type: 'confluence',
      content: `「${userName}」visited「[${pageTitle}](${location.href})」at「${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}」`,
    }),
  };
  $.ajax(settings).done(function (response) {
    // ConCon.log(response);
  });
  // function setImgWidthHeight () {
  //   ConCon.log('setImgWidthHeight');
  //   const $ = window.jQuery || window.$;
  //   if ($) {
  //     $('img').each(function () {
  //       const $this = $(this);
  //       if (!$this) return;
  //       const src = $this.attr('src');
  //       if (!src) return;
  //       const width = src.match(/width=([0-9]+[a-z%]+)/);
  //       const height = src.match(/height=([0-9]+[a-z%]+)/);
  //       if (width && width[1]) $this.width(width[1]);
  //       if (height && height[1]) $this.height(height[1]);
  //     });
  //     return true;
  //   }
  //   return false;
  // }
  // Wrong
  // $(window).on('DOMContentLoaded', function () {
  //   ConCon.log('window.DOMContentLoaded');
  // });
  // ICON: https://blog.mazey.net/wp-content/uploads/2023/04/date-blue.png
  // HTML <a>: <a href="https://example.com">Example Text #date-2023-04-13</a>
  // Use jQuery to add the icon in the content of the <a>
  // Example: <a href="https://example.com">Example Text <img src="https://blog.mazey.net/wp-content/uploads/2023/04/date-blue.png">2023-04-13</a>
  // And then, add CSS/Style to the <img> to make it looks better.
  // Let the ICON looks like a part of the <a> text. The size is similar to the text.
  // And the page has many <a> like this, so we need to use jQuery to do this.
  function addIconToA (selector = '.wiki-content') {
    const aDom = $(`${selector} a`); // $('.wiki-content a'); jQuery('.entry-content a');
    if (aDom.length) {
      aDom.each(function () {
        // const href = $(this).attr('href');
        // It's <a> text content instead of <a> href
        const href = $(this).text();
        if (href.includes('#date-')) {
          // Error
          // $(this).append('<img src="https://blog.mazey.net/wp-content/uploads/2023/04/date-blue.png" />');
          // Replace `#date-` with <img>
          $(this).html($(this).html().replace('#date-', '<img src="https://blog.mazey.net/wp-content/uploads/2023/04/date-blue.png" />'));
          // Add CSS/Style to the <img>
          // The ICON looks like a part of the <a> text. The size is similar to the text.
          // The ICON looks higher than the text, Please help me to adjust it.
          $(this).css({
            alignItems: 'center',
            flexWrap: 'wrap',
          });
          const len = '0.8em';
          $(this).find('img').css({
            width: len,
            height: len,
            // verticalAlign: 'middle',
            marginLeft: '0.2em',
            marginRight: '0.1em',
          });
        }
      });
    }
  }
  addIconToA();
  addIconToA('.entry-content');

  // $(document).ready(function () {
  //   // ConCon.log('document.ready');
  //   try {
  //     // setImgWidthHeight();
  //     setImgWidHeiBySrc();
  //   } catch (err) {
  //     ConCon.log('setImgWidthHeight error', err);
  //   }
  // });
  // window.addEventListener('load', () => {
  //   try {
  //     setImgWidHeiBySrc();
  //   } catch (err) {
  //     ConCon.log('setImgWidthHeight error', err);
  //   }
  // });
  setImgWidHeiBySrc();
  $(window).on('load', function () {
    ConCon.log('window.load');
    try {
      // setImgWidthHeight();
      setImgWidHeiBySrc();
    } catch (err) {
      ConCon.log('setImgWidthHeight error', err);
    }
  });

  // Here's a jQuery script that replaces all text "Br" in a table within the div.entry-content with <br />:
  function replaceBrWithLineBreak (className) {
    if (!$('.' + className).length) {
      // console.log('Error: Element with class name ' + className + ' not found.');
      return;
    }
    $('.' + className + " table td:contains('Br')").each(function () {
      const html = $(this).html().replace(/Br/g, '<br style="display: inline;" />');
      $(this).html(html);
    });
  }
  replaceBrWithLineBreak('wiki-content');
  replaceBrWithLineBreak('entry-content');
}

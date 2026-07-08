// ==UserScript==
// @name         Добавить русский язык в Previews (For Twitch & YouTube & Kick)
// @namespace    https://github.com/denis-ershov/previews-for-ttv-yt-russian-language
// @version      1.0.1
// @description:🇷🇺 Добавляет русский язык в настройки браузерного расширения "Previews (For Twitch & YouTube & Kick)"
// @description:en Adds Russian language option to "Previews (For Twitch & YouTube & Kick)" browser extension settings
// @author       Denis Ershov
// @match        *://*.twitch.tv/*
// @match        *://*.youtube.com/*
// @match        *://*.kick.com/*
// @icon         https://raw.githubusercontent.com/denis-ershov/previews-for-ttv-yt-russian-language/main/icon.png
// @homepage     https://github.com/denis-ershov/previews-for-ttv-yt-russian-language
// @supportURL   https://github.com/denis-ershov/previews-for-ttv-yt-russian-language/issues
// @updateURL    https://github.com/denis-ershov/previews-for-ttv-yt-russian-language/raw/main/russian-language-addon.user.js
// @downloadURL  https://github.com/denis-ershov/previews-for-ttv-yt-russian-language/raw/main/russian-language-addon.user.js
// @license      MIT
// @grant        none
// @run-at       document-start
// ==/UserScript==

/**
 * Дополнение русского языка для расширения "Previews (For Twitch & YouTube & Kick)"
 * 
 * Этот пользовательский скрипт автоматически добавляет опцию русского языка
 * в селектор языков в настройках браузерного расширения "Previews (For Twitch & YouTube & Kick)".
 * 
 * Репозиторий: https://github.com/denis-ershov/previews-for-ttv-yt-russian-language
 * Лицензия: MIT
 */

(function() {
    'use strict';

    const CONFIG = {
        selector: '#tp_settings_lang_selector',
        optionValue: 'ru',
        optionText: 'Русский',
        pollDelayMs: 1000,
        maxPollAttempts: 15,
        debugPrefix: '[Русский язык для Previews]'
    };

    let isInstalled = false;
    let pollAttempts = 0;
    let pollTimerId = 0;
    let scheduledScanId = 0;
    let observer = null;

    function log(message, extra) {
        if (typeof extra === 'undefined') {
            console.log(CONFIG.debugPrefix, message);
            return;
        }

        console.log(CONFIG.debugPrefix, message, extra);
    }

    function cleanup() {
        if (pollTimerId) {
            clearTimeout(pollTimerId);
            pollTimerId = 0;
        }

        if (scheduledScanId) {
            clearTimeout(scheduledScanId);
            scheduledScanId = 0;
        }

        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    function installRussianLanguageOption() {
        const selector = document.querySelector(CONFIG.selector);

        if (!selector) {
            return false;
        }

        if (selector.querySelector(`option[value="${CONFIG.optionValue}"]`)) {
            isInstalled = true;
            cleanup();
            log('Опция русского языка уже доступна');
            return true;
        }

        const russianOption = document.createElement('option');
        russianOption.value = CONFIG.optionValue;
        russianOption.textContent = CONFIG.optionText;
        selector.appendChild(russianOption);

        isInstalled = true;
        cleanup();
        log('Русский язык успешно добавлен');
        return true;
    }

    function scanForSelector() {
        scheduledScanId = 0;

        if (isInstalled) {
            return;
        }

        installRussianLanguageOption();
    }

    function scheduleScan(delayMs) {
        if (isInstalled || scheduledScanId) {
            return;
        }

        scheduledScanId = window.setTimeout(scanForSelector, delayMs);
    }

    function startObserver() {
        if (observer || isInstalled) {
            return;
        }

        observer = new MutationObserver(function(mutations) {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (!(node instanceof Element)) {
                        continue;
                    }

                    if (
                        node.matches?.(CONFIG.selector) ||
                        node.querySelector?.(CONFIG.selector)
                    ) {
                        scheduleScan(0);
                        return;
                    }
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function startPollingFallback() {
        if (isInstalled || pollAttempts >= CONFIG.maxPollAttempts) {
            if (!isInstalled && pollAttempts >= CONFIG.maxPollAttempts) {
                log('Резервные проверки остановлены');
            }

            pollTimerId = 0;
            return;
        }

        pollAttempts += 1;
        installRussianLanguageOption();

        if (!isInstalled) {
            pollTimerId = window.setTimeout(startPollingFallback, CONFIG.pollDelayMs);
        }
    }

    function init() {
        installRussianLanguageOption();
        startObserver();
        startPollingFallback();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    window.addEventListener('beforeunload', cleanup, { once: true });
})();
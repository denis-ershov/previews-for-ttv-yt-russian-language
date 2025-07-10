// ==UserScript==
// @name         Добавить русский язык в Previews (For TTV & YT)
// @namespace    https://github.com/denis-ershov/previews-for-ttv-yt-russian-language
// @version      1.0.0
// @description:🇷🇺 Добавляет русский язык в настройки браузерного расширения "Previews (For TTV & YT)"
// @description:en Adds Russian language option to "Previews (For TTV & YT)" browser extension settings
// @author       Denis Ershov
// @match        *://*.twitch.tv/*
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
 * Дополнение русского языка для расширения "Previews (For TTV & YT)"
 * 
 * Этот пользовательский скрипт автоматически добавляет опцию русского языка
 * в селектор языков в настройках браузерного расширения "Previews (For TTV & YT)".
 * 
 * Репозиторий: https://github.com/denis-ershov/previews-for-ttv-yt-russian-language
 * Лицензия: MIT
 */

(function() {
    'use strict';
    
    // Конфигурация
    const CONFIG = {
        SELECTOR: '#tp_settings_lang_selector',
        OPTION_VALUE: 'ru',
        OPTION_TEXT: 'Русский',
        MAX_ATTEMPTS: 20,
        CHECK_INTERVAL: 2000,
        INITIAL_DELAY: 1000
    };
    
    // Отслеживание состояния
    let attempts = 0;
    let isAdded = false;
    let intervalId = null;
    
    /**
     * Добавляет опцию русского языка в селектор языков
     * @returns {boolean} True если опция была добавлена, false в противном случае
     */
    function addRussianOption() {
        const langSelector = document.querySelector(CONFIG.SELECTOR);
        
        if (!langSelector) {
            return false;
        }
        
        // Проверяем, существует ли уже опция русского языка
        const existingRussian = langSelector.querySelector(`option[value="${CONFIG.OPTION_VALUE}"]`);
        
        if (existingRussian) {
            console.log('[Русский язык для Previews] Опция русского языка уже существует');
            return true;
        }
        
        try {
            // Создаем новый элемент опции
            const russianOption = document.createElement('option');
            russianOption.value = CONFIG.OPTION_VALUE;
            russianOption.textContent = CONFIG.OPTION_TEXT;
            
            // Добавляем опцию в селектор
            langSelector.appendChild(russianOption);
            
            console.log('[Русский язык для Previews] ✅ Русский язык успешно добавлен в селектор');
            return true;
            
        } catch (error) {
            console.error('[Русский язык для Previews] ❌ Ошибка при добавлении русской опции:', error);
            return false;
        }
    }
    
    /**
     * Обрабатывает успешное добавление опции русского языка
     */
    function onSuccessfulAdd() {
        isAdded = true;
        
        // Очищаем интервал если он запущен
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        
        // Отключаем наблюдатель если он существует
        if (window.russianLangObserver) {
            window.russianLangObserver.disconnect();
            window.russianLangObserver = null;
        }
        
        console.log('[Русский язык для Previews] 🎉 Настройка завершена успешно');
    }
    
    /**
     * Проверяет наличие селектора языков и добавляет русскую опцию
     */
    function checkAndAdd() {
        if (isAdded) return;
        
        const success = addRussianOption();
        
        if (success) {
            onSuccessfulAdd();
        }
    }
    
    /**
     * Настраивает наблюдатель за изменениями DOM
     */
    function setupObserver() {
        // Избегаем множественных наблюдателей
        if (window.russianLangObserver) {
            return;
        }
        
        window.russianLangObserver = new MutationObserver(function(mutations) {
            if (isAdded) return;
            
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Узел элемента
                        // Проверяем, содержит ли добавленный узел наш селектор
                        if (node.querySelector && node.querySelector(CONFIG.SELECTOR)) {
                            setTimeout(checkAndAdd, 100);
                        }
                        
                        // Проверяем, является ли добавленный узел нашим селектором
                        if (node.id === 'tp_settings_lang_selector') {
                            setTimeout(checkAndAdd, 100);
                        }
                    }
                });
            });
        });
        
        // Начинаем наблюдение
        window.russianLangObserver.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });
        
        console.log('[Русский язык для Previews] 👀 Наблюдатель DOM запущен');
    }
    
    /**
     * Настраивает периодические проверки
     */
    function setupPeriodicChecks() {
        intervalId = setInterval(function() {
            attempts++;
            
            checkAndAdd();
            
            // Останавливаем после максимального количества попыток
            if (attempts >= CONFIG.MAX_ATTEMPTS) {
                clearInterval(intervalId);
                intervalId = null;
                console.log('[Русский язык для Previews] ⏰ Остановлены периодические проверки после', CONFIG.MAX_ATTEMPTS, 'попыток');
            }
        }, CONFIG.CHECK_INTERVAL);
        
        console.log('[Русский язык для Previews] ⏱️ Периодические проверки запущены');
    }
    
    /**
     * Инициализирует пользовательский скрипт
     */
    function init() {
        console.log('[Русский язык для Previews] 🚀 Инициализация...');
        
        // Ждем готовности DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(init, 100);
            });
            return;
        }
        
        // Первоначальная проверка
        setTimeout(checkAndAdd, CONFIG.INITIAL_DELAY);
        
        // Настраиваем наблюдатель для динамического контента
        if (document.body) {
            setupObserver();
        } else {
            // Ждем доступности body
            setTimeout(function() {
                if (document.body) {
                    setupObserver();
                }
            }, 100);
        }
        
        // Настраиваем периодические проверки как резерв
        setTimeout(setupPeriodicChecks, CONFIG.INITIAL_DELAY);
    }
    
    // Запускаем инициализацию
    init();
    
    // Очистка при выгрузке страницы
    window.addEventListener('beforeunload', function() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        if (window.russianLangObserver) {
            window.russianLangObserver.disconnect();
        }
    });
    
})();
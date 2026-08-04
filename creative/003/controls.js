const sidebar = document.getElementById('sidebar');
const sliderRoot = document.getElementById('slider-root');
const debugOutput = document.getElementById('debug-output');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const app = document.querySelector('.app');

const sliderBindings = [];

function formatValue(value) {
    if (typeof value === 'number') {
        return Number.isInteger(value) ? String(value) : value.toFixed(3);
    }
    return String(value);
}

function createSlider({ id, label, min, max, step, get, set }) {
    const control = document.createElement('div');
    control.className = 'control';
    control.dataset.controlId = id;

    const labelEl = document.createElement('span');
    labelEl.className = 'control-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = 'control-value';

    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(get());

    const sync = () => {
        const value = get();
        input.value = String(value);
        valueEl.textContent = formatValue(value);
    };

    input.addEventListener('input', () => {
        set(Number(input.value));
        sync();
    });

    control.append(labelEl, valueEl, input);
    sliderRoot.appendChild(control);

    sliderBindings.push({ id, sync });
    sync();
}

function initControls(sliderConfig) {
    sliderRoot.replaceChildren();
    sliderBindings.length = 0;

    for (const config of sliderConfig) {
        createSlider(config);
    }
}

function syncControls() {
    for (const binding of sliderBindings) {
        binding.sync();
    }
}

function setDebugOutput(text) {
    debugOutput.textContent = text;
}

function setSidebarOpen(isOpen) {
    sidebar.classList.toggle('is-collapsed', !isOpen);
    app.classList.toggle('sidebar-collapsed', !isOpen);
    sidebarToggle.textContent = isOpen ? 'Hide panel' : 'Show panel';
}

function initSidebar() {
    const toggle = () => setSidebarOpen(sidebar.classList.contains('is-collapsed'));

    sidebarToggle.addEventListener('click', toggle);
    sidebarClose.addEventListener('click', () => setSidebarOpen(false));
}

function isSidebarOpen() {
    return !sidebar.classList.contains('is-collapsed');
}

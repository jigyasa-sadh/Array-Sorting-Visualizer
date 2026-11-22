
const container = document.getElementById("visualizer-container");
const algoSelect = document.getElementById("algorithm-select");
const orderSelect = document.getElementById("order-select");
const speedSelect = document.getElementById("speed-select");
const complexityDisplay = document.getElementById("complexity-display");
const statusText = document.getElementById("status-text");
const inputError = document.getElementById("input-error");

const btnToggleGuide = document.getElementById("btn-toggle-guide");
const guideContent = document.getElementById("guide-content");

const sizeInput = document.getElementById("array-size");
const elementsInput = document.getElementById("array-elements");
const btnSetArray = document.getElementById("btn-set-array");
const btnGenerate = document.getElementById("btn-generate");
const btnStart = document.getElementById("btn-start");

let array = [];

// Toggle How-to-Use Guide
btnToggleGuide.addEventListener("click", () => {
    const isCollapsed = guideContent.classList.toggle("collapsed");
    btnToggleGuide.textContent = isCollapsed ? "Show Guide" : "Hide Guide";
});

// Bar Color Themes
const COLOR_DEFAULT = "linear-gradient(to top, #ff758c, #ff7eb3)";
const COLOR_COMPARE = "#4cc9f0"; // Cyan: Comparing elements
const COLOR_SWAP    = "#f72585"; // Magenta: Swapping / Pivot / Shifting
const COLOR_SORTED  = "#06d6a0"; // Green: Final sorted position

// Complexities & How-It-Works Database
const complexities = {
    'bubble': `Bubble Sort: Repeatedly compares adjacent elements and swaps them if they are in the wrong order.\nTime: Best O(n) | Avg O(n²) | Worst O(n²)  •  Space: O(1)`,
    'insertion': `Insertion Sort: Picks one element at a time and shifts larger/smaller sorted elements right to insert it.\nTime: Best O(n) | Avg O(n²) | Worst O(n²)  •  Space: O(1)`,
    'selection': `Selection Sort: Scans the unsorted part to find the min/max element and swaps it to the front.\nTime: Best O(n²) | Avg O(n²) | Worst O(n²)  •  Space: O(1)`,
    'merge': `Merge Sort: Recursively divides the array into halves and merges them back in the chosen order.\nTime: Best O(n log n) | Avg O(n log n) | Worst O(n log n)  •  Space: O(n)`,
    'quick': `Quick Sort: Picks a pivot element and partitions elements to the left or right based on sort order.\nTime: Best O(n log n) | Avg O(n log n) | Worst O(n²)  •  Space: O(log n)`,
    'shell': `Shell Sort: Compares and sorts elements separated by a shrinking gap before final insertion pass.\nTime: Best O(n log n) | Avg O(n^1.5) | Worst O(n²)  •  Space: O(1)`,
    'radix': `Radix Sort: Sorts non-negative integers digit by digit from least significant to most significant.\nTime: Best O(nk) | Avg O(nk) | Worst O(nk)  •  Space: O(n+k)`
};

function updateComplexity() {
    complexityDisplay.textContent = complexities[algoSelect.value] || "Select an algorithm";
}

algoSelect.addEventListener("change", updateComplexity);

function getOrder() {
    return orderSelect.value; // 'asc' or 'desc'
}

function getDelay() {
    return parseInt(speedSelect.value, 10);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setStatus(message) {
    statusText.textContent = message;
}

// Returns true if `a` should come BEFORE `b` in the chosen order
function isInCorrectOrder(a, b, order) {
    return order === "asc" ? a <= b : a >= b;
}

// Returns true if `candidate` should replace/be placed ahead of `currentTarget`
function shouldPlaceBefore(candidate, currentTarget, order) {
    return order === "asc" ? candidate < currentTarget : candidate > currentTarget;
}

// Render bars scaled dynamically to the max value in the array
function renderBars(arr) {
    container.innerHTML = "";
    const maxVal = Math.max(...arr, 1);

    arr.forEach(val => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        const scaledHeight = Math.max(20, Math.round((val / maxVal) * 185));
        bar.style.height = `${scaledHeight}px`;

        const label = document.createElement("span");
        label.innerText = val;
        bar.appendChild(label);

        container.appendChild(bar);
    });
}

function updateBar(bar, val) {
    const maxVal = Math.max(...array, 1);
    const scaledHeight = Math.max(20, Math.round((val / maxVal) * 185));
    bar.style.height = `${scaledHeight}px`;
    bar.querySelector("span").innerText = val;
}

// Handle User Custom Array Input
btnSetArray.addEventListener("click", () => {
    inputError.textContent = "";
    const size = parseInt(sizeInput.value, 10);
    const rawText = elementsInput.value.trim();

    if (isNaN(size) || size < 2 || size > 20) {
        inputError.textContent = "Please enter an array size between 2 and 20.";
        return;
    }

    if (!rawText) {
        inputError.textContent = `Please enter ${size} numbers separated by commas or spaces.`;
        return;
    }

    const parsed = rawText
        .split(/[\s,]+/)
        .filter(item => item !== "")
        .map(Number);

    if (parsed.some(num => isNaN(num) || num < 0 || !Number.isInteger(num))) {
        inputError.textContent = "Please enter valid non-negative whole numbers only.";
        return;
    }

    if (parsed.length !== size) {
        inputError.textContent = `Size mismatch: You specified size ${size}, but entered ${parsed.length} element(s).`;
        return;
    }

    array = parsed;
    renderBars(array);
    setStatus(`Custom array of size ${size} loaded: [${array.join(", ")}]. Choose an algorithm & order, then click "Sort Array".`);
});

// Generate Random Array using the Size input
function generateRandomArray() {
    inputError.textContent = "";
    let size = parseInt(sizeInput.value, 10);
    if (isNaN(size) || size < 2 || size > 20) {
        size = 8;
        sizeInput.value = 8;
    }

    array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 90) + 10);
    }

    elementsInput.value = array.join(", ");
    renderBars(array);
    setStatus(`Generated a random array of ${size} numbers. Click "Sort Array" to visualize or type custom numbers above.`);
}

// 1. BUBBLE SORT
async function bubbleSort(bars, order) {
    const n = array.length;
    const opSymbol = order === "asc" ? ">" : "<";

    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            bars[j].style.background = COLOR_COMPARE;
            bars[j + 1].style.background = COLOR_COMPARE;
            setStatus(`Pass ${i + 1} (${order.toUpperCase()}): Comparing adjacent elements ${array[j]} and ${array[j + 1]}...`);
            await sleep(getDelay());

            const needsSwap = order === "asc" ? array[j] > array[j + 1] : array[j] < array[j + 1];
            if (needsSwap) {
                setStatus(`${array[j]} ${opSymbol} ${array[j + 1]} → Swapping ${array[j]} and ${array[j + 1]}`);
                bars[j].style.background = COLOR_SWAP;
                bars[j + 1].style.background = COLOR_SWAP;

                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                updateBar(bars[j], array[j]);
                updateBar(bars[j + 1], array[j + 1]);
                swapped = true;
                await sleep(getDelay());
            }

            bars[j].style.background = COLOR_DEFAULT;
            bars[j + 1].style.background = COLOR_DEFAULT;
        }
        bars[n - 1 - i].style.background = COLOR_SORTED;
        if (!swapped) {
            setStatus("No swaps in this pass — array is already in the selected order!");
            break;
        }
    }
    for (let k = 0; k < n; k++) bars[k].style.background = COLOR_SORTED;
}

// 2. SELECTION SORT
async function selectionSort(bars, order) {
    const n = array.length;
    const targetLabel = order === "asc" ? "minimum" : "maximum";

    for (let i = 0; i < n; i++) {
        let bestIdx = i;
        bars[bestIdx].style.background = COLOR_SWAP;
        setStatus(`Pass ${i + 1} (${order.toUpperCase()}): Assuming ${array[bestIdx]} at index ${i} is the ${targetLabel}.`);
        await sleep(getDelay());

        for (let j = i + 1; j < n; j++) {
            bars[j].style.background = COLOR_COMPARE;
            setStatus(`Comparing current ${targetLabel} (${array[bestIdx]}) with ${array[j]}...`);
            await sleep(getDelay());

            if (shouldPlaceBefore(array[j], array[bestIdx], order)) {
                bars[bestIdx].style.background = COLOR_DEFAULT;
                bestIdx = j;
                bars[bestIdx].style.background = COLOR_SWAP;
                setStatus(`New ${targetLabel} found: ${array[bestIdx]}`);
                await sleep(getDelay());
            } else {
                bars[j].style.background = COLOR_DEFAULT;
            }
        }

        if (bestIdx !== i) {
            setStatus(`Swapping ${targetLabel} ${array[bestIdx]} into position ${i} (with ${array[i]})`);
            [array[i], array[bestIdx]] = [array[bestIdx], array[i]];
            updateBar(bars[i], array[i]);
            updateBar(bars[bestIdx], array[bestIdx]);
            await sleep(getDelay());
            bars[bestIdx].style.background = COLOR_DEFAULT;
        }
        bars[i].style.background = COLOR_SORTED;
    }
}

// 3. INSERTION SORT
async function insertionSort(bars, order) {
    const n = array.length;
    const opSymbol = order === "asc" ? ">" : "<";
    bars[0].style.background = COLOR_SORTED;

    for (let i = 1; i < n; i++) {
        let key = array[i];
        let j = i - 1;
        bars[i].style.background = COLOR_SWAP;
        setStatus(`Selected key = ${key} (${order.toUpperCase()}). Comparing leftwards to find its spot...`);
        await sleep(getDelay());

        while (j >= 0 && !isInCorrectOrder(array[j], key, order)) {
            bars[j].style.background = COLOR_COMPARE;
            setStatus(`${array[j]} ${opSymbol} ${key} → Shifting ${array[j]} to the right`);
            array[j + 1] = array[j];
            updateBar(bars[j + 1], array[j + 1]);
            await sleep(getDelay());
            bars[j].style.background = COLOR_SORTED;
            j--;
        }

        array[j + 1] = key;
        updateBar(bars[j + 1], key);
        setStatus(`Inserted ${key} at index ${j + 1}`);
        for (let k = 0; k <= i; k++) bars[k].style.background = COLOR_SORTED;
        await sleep(getDelay());
    }
}

// 4. MERGE SORT
async function mergeSort(bars, order, left = 0, right = array.length - 1) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);

    await mergeSort(bars, order, left, mid);
    await mergeSort(bars, order, mid + 1, right);
    await merge(bars, order, left, mid, right);

    if (left === 0 && right === array.length - 1) {
        for (let k = 0; k < array.length; k++) bars[k].style.background = COLOR_SORTED;
    }
}

async function merge(bars, order, left, mid, right) {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    setStatus(`Merging (${order.toUpperCase()}) [${leftArr.join(", ")}] and [${rightArr.join(", ")}]`);

    let i = 0, j = 0, k = left;
    while (i < leftArr.length && j < rightArr.length) {
        bars[k].style.background = COLOR_COMPARE;
        setStatus(`Comparing ${leftArr[i]} and ${rightArr[j]} during merge...`);
        await sleep(getDelay());

        if (isInCorrectOrder(leftArr[i], rightArr[j], order)) {
            array[k] = leftArr[i++];
        } else {
            array[k] = rightArr[j++];
        }
        bars[k].style.background = COLOR_SWAP;
        updateBar(bars[k], array[k]);
        await sleep(getDelay());
        bars[k].style.background = COLOR_DEFAULT;
        k++;
    }

    while (i < leftArr.length) {
        array[k] = leftArr[i++];
        bars[k].style.background = COLOR_SWAP;
        updateBar(bars[k], array[k]);
        await sleep(getDelay());
        bars[k].style.background = COLOR_DEFAULT;
        k++;
    }

    while (j < rightArr.length) {
        array[k] = rightArr[j++];
        bars[k].style.background = COLOR_SWAP;
        updateBar(bars[k], array[k]);
        await sleep(getDelay());
        bars[k].style.background = COLOR_DEFAULT;
        k++;
    }
}

// 5. QUICK SORT
async function quickSort(bars, order, low = 0, high = array.length - 1) {
    if (low < high) {
        const pi = await partition(bars, order, low, high);
        bars[pi].style.background = COLOR_SORTED;
        await quickSort(bars, order, low, pi - 1);
        await quickSort(bars, order, pi + 1, high);
    } else if (low === high && low >= 0 && low < bars.length) {
        bars[low].style.background = COLOR_SORTED;
    }
}

async function partition(bars, order, low, high) {
    const pivot = array[high];
    const opSymbol = order === "asc" ? "<" : ">";
    bars[high].style.background = COLOR_SWAP;
    setStatus(`Pivot chosen: ${pivot} (at index ${high}) [${order.toUpperCase()}]`);
    await sleep(getDelay());

    let i = low - 1;
    for (let j = low; j < high; j++) {
        bars[j].style.background = COLOR_COMPARE;
        setStatus(`Comparing ${array[j]} with pivot ${pivot}...`);
        await sleep(getDelay());

        if (shouldPlaceBefore(array[j], pivot, order)) {
            i++;
            setStatus(`${array[j]} ${opSymbol} ${pivot} → Moving ${array[j]} to the left partition`);
            [array[i], array[j]] = [array[j], array[i]];
            updateBar(bars[i], array[i]);
            updateBar(bars[j], array[j]);
            await sleep(getDelay());
        }
        bars[j].style.background = COLOR_DEFAULT;
    }

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    updateBar(bars[i + 1], array[i + 1]);
    updateBar(bars[high], array[high]);
    bars[high].style.background = COLOR_DEFAULT;
    setStatus(`Placed pivot ${pivot} in its final sorted position (index ${i + 1})`);
    await sleep(getDelay());
    return i + 1;
}

// 6. SHELL SORT
async function shellSort(bars, order) {
    const n = array.length;
    const opSymbol = order === "asc" ? ">" : "<";

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        setStatus(`Shell Sort (${order.toUpperCase()}): Using gap = ${gap}`);
        await sleep(getDelay());

        for (let i = gap; i < n; i++) {
            let temp = array[i];
            let j = i;
            bars[i].style.background = COLOR_COMPARE;

            while (j >= gap && !isInCorrectOrder(array[j - gap], temp, order)) {
                bars[j - gap].style.background = COLOR_SWAP;
                setStatus(`Gap ${gap}: ${array[j - gap]} ${opSymbol} ${temp} → Shifting ${array[j - gap]} forward`);
                array[j] = array[j - gap];
                updateBar(bars[j], array[j]);
                await sleep(getDelay());
                bars[j - gap].style.background = COLOR_DEFAULT;
                j -= gap;
            }
            array[j] = temp;
            updateBar(bars[j], temp);
            bars[i].style.background = COLOR_DEFAULT;
        }
    }
    for (let k = 0; k < n; k++) bars[k].style.background = COLOR_SORTED;
}

// 7. RADIX SORT
async function radixSort(bars, order) {
    const maxNum = Math.max(...array);
    for (let exp = 1; Math.floor(maxNum / exp) > 0; exp *= 10) {
        setStatus(`Radix Sort: Grouping numbers by digit place (${exp}s place)...`);
        await countingSortByDigit(bars, exp);
    }

    if (order === "desc") {
        setStatus("Reversing digit-sorted array for Descending order...");
        array.reverse();
        for (let i = 0; i < array.length; i++) {
            bars[i].style.background = COLOR_SWAP;
            updateBar(bars[i], array[i]);
            await sleep(getDelay() / 2);
            bars[i].style.background = COLOR_DEFAULT;
        }
    }

    for (let k = 0; k < array.length; k++) bars[k].style.background = COLOR_SORTED;
}

async function countingSortByDigit(bars, exp) {
    const n = array.length;
    const output = new Array(n).fill(0);
    const count = new Array(10).fill(0);

    for (let i = 0; i < n; i++) {
        const digit = Math.floor(array[i] / exp) % 10;
        count[digit]++;
        bars[i].style.background = COLOR_COMPARE;
        setStatus(`Inspecting ${array[i]} → digit at ${exp}s place is ${digit}`);
        await sleep(getDelay() / 2);
        bars[i].style.background = COLOR_DEFAULT;
    }

    for (let i = 1; i < 10; i++) count[i] += count[i - 1];

    for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(array[i] / exp) % 10;
        output[count[digit] - 1] = array[i];
        count[digit]--;
    }

    for (let i = 0; i < n; i++) {
        array[i] = output[i];
        bars[i].style.background = COLOR_SWAP;
        updateBar(bars[i], array[i]);
        setStatus(`Placed ${array[i]} according to its ${exp}s place digit`);
        await sleep(getDelay());
        bars[i].style.background = COLOR_DEFAULT;
    }
}

// Toggle Controls During Sorting
function setControlsDisabled(disabled) {
    btnStart.disabled = disabled;
    btnGenerate.disabled = disabled;
    btnSetArray.disabled = disabled;
    algoSelect.disabled = disabled;
    orderSelect.disabled = disabled;
    speedSelect.disabled = disabled;
    sizeInput.disabled = disabled;
    elementsInput.disabled = disabled;
}

// Start Button Handler
btnStart.addEventListener("click", async () => {
    if (array.length === 0) return;

    const bars = document.getElementsByClassName("bar");
    for (let b of bars) b.style.background = COLOR_DEFAULT;

    setControlsDisabled(true);
    const algo = algoSelect.value;
    const order = getOrder();

    if (algo === 'bubble') await bubbleSort(bars, order);
    else if (algo === 'selection') await selectionSort(bars, order);
    else if (algo === 'insertion') await insertionSort(bars, order);
    else if (algo === 'merge') await mergeSort(bars, order);
    else if (algo === 'quick') await quickSort(bars, order);
    else if (algo === 'shell') await shellSort(bars, order);
    else if (algo === 'radix') await radixSort(bars, order);

    const orderLabel = order === "asc" ? "Ascending" : "Descending";
    setStatus(`Sorting complete (${orderLabel})! Final array: [${array.join(", ")}]`);
    setControlsDisabled(false);
});

btnGenerate.addEventListener("click", generateRandomArray);

// Initialize
updateComplexity();
generateRandomArray();

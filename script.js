const container = document.getElementById("visualizer-container");
const algoSelect = document.getElementById("algorithm-select");
const complexityDisplay = document.getElementById("complexity-display");
const btnGenerate = document.getElementById("btn-generate");
const btnStart = document.getElementById("btn-start");

let array = [];
const size = 12; // Video ki tarah clean look ke liye fixed chota size

// Complexities Database
const complexities = {
    'bubble': `Time Complexity\nBest Case : O(n) | Average Case : O(n²) | Worst Case : O(n²)\nSpace Complexity : O(1)`,
    'insertion': `Time Complexity\nBest Case : O(n) | Average Case : O(n²) | Worst Case : O(n²)\nSpace Complexity : O(1)`,
    'selection': `Time Complexity\nBest Case : O(n²) | Average Case : O(n²) | Worst Case : O(n²)\nSpace Complexity : O(1)`,
    'merge': `Time Complexity\nBest Case : O(n log n) | Average Case : O(n log n) | Worst Case : O(n log n)\nSpace Complexity : O(n)`,
    'quick': `Time Complexity\nBest Case : O(n log n) | Average Case : O(n log n) | Worst Case : O(n²)\nSpace Complexity : O(log n)`,
    'shell': `Time Complexity\nBest Case : O(n log n) | Average Case : O(n^1.5) | Worst Case : O(n²)\nSpace Complexity : O(1)`,
    'radix': `Time Complexity\nBest Case : O(nk) | Average Case : O(nk) | Worst Case : O(nk)\nSpace Complexity : O(n+k)`
};

function updateComplexity() {
    complexityDisplay.textContent = complexities[algoSelect.value] || "Select an algorithm";
}

algoSelect.addEventListener("change", updateComplexity);

// Generate Array with Numbers on Bars
function generateArray() {
    container.innerHTML = "";
    array = [];
    
    for (let i = 0; i < size; i++) {
        let val = Math.floor(Math.random() * 150) + 30; // Heights
        array.push(val);
        
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${val}px`;
        
        const label = document.createElement("span");
        label.innerText = val; // Bar ke upar number show hoga
        bar.appendChild(label);
        
        container.appendChild(bar);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateBar(bar, val) {
    bar.style.height = `${val}px`;
    bar.querySelector("span").innerText = val;
}

// Sorting Algorithms implementation
async function bubbleSort(bars) {
    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            bars[j].style.backgroundColor = "#4cc9f0";
            bars[j + 1].style.backgroundColor = "#4cc9f0";

            if (array[j] > array[j + 1]) {
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;

                updateBar(bars[j], array[j]);
                updateBar(bars[j + 1], array[j + 1]);
            }
            await sleep(200);
            bars[j].style.background = "linear-gradient(to top, #ff758c, #ff7eb3)";
            bars[j + 1].style.background = "linear-gradient(to top, #ff758c, #ff7eb3)";
        }
    }
}

async function selectionSort(bars) {
    for (let i = 0; i < array.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < array.length; j++) {
            if (array[j] < array[minIdx]) minIdx = j;
        }
        let temp = array[i];
        array[i] = array[minIdx];
        array[minIdx] = temp;
        updateBar(bars[i], array[i]);
        updateBar(bars[minIdx], array[minIdx]);
        await sleep(250);
    }
}

async function insertionSort(bars) {
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;
        while (j >= 0 && array[j] > key) {
            array[j + 1] = array[j];
            updateBar(bars[j + 1], array[j + 1]);
            j--;
            await sleep(200);
        }
        array[j + 1] = key;
        updateBar(bars[j + 1], array[j + 1]);
    }
}

// Start Button Handler
btnStart.addEventListener("click", async () => {
    btnStart.disabled = true;
    btnGenerate.disabled = true;
    
    const algo = algoSelect.value;
    const bars = document.getElementsByClassName("bar");

    if (algo === 'bubble') await bubbleSort(bars);
    else if (algo === 'selection') await selectionSort(bars);
    else if (algo === 'insertion') await insertionSort(bars);
    else await bubbleSort(bars); // Fallback

    btnStart.disabled = false;
    btnGenerate.disabled = false;
});

btnGenerate.addEventListener("click", generateArray);

// Initialize
updateComplexity();
generateArray();
document.addEventListener('DOMContentLoaded', function() {
    const topicSelect = document.getElementById('topic');
    const geometryShapeDiv = document.getElementById('geometryShapeDiv');
    const shapeSelect = document.getElementById('shape');
    const inputsArea = document.getElementById('inputs-area');
    const calcBtn = document.getElementById('calcBtn');
    const resultDiv = document.getElementById('result');
    const formulaDisplay = document.getElementById('formulaDisplay');

    // ---- دیکشنری فرمول‌های آموزشی ----
    const formulas = {
        geometry: `📐 فرمول‌های هندسی:
• مربع: مساحت = ضلع² ، محیط = 4 × ضلع
• مستطیل: مساحت = طول × عرض ، محیط = 2×(طول+عرض)
• دایره: مساحت = πr² ، محیط = 2πr
• مثلث (قائمه): مساحت = (قاعده×ارتفاع)/2
• مکعب: حجم = یال³ ، مساحت کل = 6×یال²
• کره: حجم = (4/3)πr³`,
        percent: `٪ درصد:
• درصد یک عدد: (درصد × عدد) ÷ 100
• مقدار از کل: (جزء ÷ کل) × 100
مثال: ۲۰٪ از ۸۰ = (20×80)/100 = 16`,
        fraction: `🔢 کسر:
• تبدیل کسر به اعشار: صورت ÷ مخرج
• ساده‌سازی: تقسیم صورت و مخرج بر ب.م.م`,
        power: `🔋 توان و جذر:
• a^n = a × a × ... (n بار)
• جذر دوم: عددی که مجذور آن برابر عدد اصلی شود
• مثلاً 3² = 9 , √9 = 3`,
        equation: `✖️ معادله خطی ax + b = c:
• راه حل: x = (c - b) / a
• شرط: a ≠ 0`
    };

    function updateFormula() {
        const topic = topicSelect.value;
        let text = formulas[topic] || 'فرمولی موجود نیست.';
        formulaDisplay.innerHTML = `<pre style="font-family:inherit; margin:0; white-space:pre-wrap;">${text}</pre>`;
    }

    function toggleGeometryShape() {
        if (topicSelect.value === 'geometry') {
            geometryShapeDiv.style.display = 'block';
        } else {
            geometryShapeDiv.style.display = 'none';
        }
    }

    function updateInputs() {
        const topic = topicSelect.value;
        let html = '';

        if (topic === 'geometry') {
            const shape = shapeSelect.value;
            switch(shape) {
                case 'square':
                    html = `<div><label>ضلع (cm):</label> <input type="number" id="a" placeholder="مقدار ضلع"></div>`;
                    break;
                case 'rectangle':
                    html = `<div><label>طول (cm):</label> <input type="number" id="length"></div>
                            <div><label>عرض (cm):</label> <input type="number" id="width"></div>`;
                    break;
                case 'circle':
                    html = `<div><label>شعاع (cm):</label> <input type="number" id="r"></div>`;
                    break;
                case 'triangle':
                    html = `<div><label>قاعده (cm):</label> <input type="number" id="base"></div>
                            <div><label>ارتفاع (cm):</label> <input type="number" id="height"></div>`;
                    break;
                case 'cube':
                    html = `<div><label>طول یال (cm):</label> <input type="number" id="edge"></div>`;
                    break;
                case 'sphere':
                    html = `<div><label>شعاع (cm):</label> <input type="number" id="radius"></div>`;
                    break;
            }
        } 
        else if (topic === 'percent') {
            html = `<div><label>نوع محاسبه:</label>
                    <select id="percentType">
                        <option value="percentOf">درصد یک عدد</option>
                        <option value="whatPercent">یک عدد چند درصد عدد دیگر است؟</option>
                    </select></div>
                    <div id="percentInputs">
                        <div><label>عدد اصلی:</label> <input type="number" id="mainNum"></div>
                        <div><label>درصد / جزء:</label> <input type="number" id="percentOrPart"></div>
                    </div>`;
        }
        else if (topic === 'fraction') {
            html = `<div><label>صورت کسر:</label> <input type="number" id="numerator"></div>
                    <div><label>مخرج کسر:</label> <input type="number" id="denominator"></div>
                    <div><label>عملیات:</label>
                    <select id="fracOp">
                        <option value="decimal">تبدیل به اعشار</option>
                        <option value="simplify">ساده‌سازی کسر</option>
                    </select></div>`;
        }
        else if (topic === 'power') {
            html = `<div><label>عدد پایه:</label> <input type="number" id="baseNum"></div>
                    <div><label>نوع عملیات:</label>
                    <select id="powType">
                        <option value="power">محاسبه توان (a^n)</option>
                        <option value="sqrt">جذر دوم (√a)</option>
                    </select></div>
                    <div id="powerExponentDiv"><label>نما (عدد صحیح):</label> <input type="number" id="exponent"></div>`;
        }
        else if (topic === 'equation') {
            html = `<div><label>ضریب a (ax):</label> <input type="number" id="coeffA" step="any"></div>
                    <div><label>عدد b (ثابت):</label> <input type="number" id="constB" step="any"></div>
                    <div><label>عدد c (سمت راست):</label> <input type="number" id="constC" step="any"></div>
                    <p style="font-size:0.9rem;">معادله: ax + b = c</p>`;
        }

        inputsArea.innerHTML = html;

        if (topic === 'percent') {
            const percentType = document.getElementById('percentType');
            const updatePercentLabels = () => {
                const type = percentType.value;
                const mainLabel = document.querySelector('#percentInputs div:first-child label');
                const secondLabel = document.querySelector('#percentInputs div:last-child label');
                if (type === 'percentOf') {
                    if(mainLabel) mainLabel.innerText = 'عدد اصلی:';
                    if(secondLabel) secondLabel.innerText = 'درصد مورد نظر:';
                } else {
                    if(mainLabel) mainLabel.innerText = 'کل (عدد بزرگتر):';
                    if(secondLabel) secondLabel.innerText = 'جزء (عدد کوچکتر):';
                }
            };
            percentType.addEventListener('change', updatePercentLabels);
            updatePercentLabels();
        }

        if (topic === 'power') {
            const powType = document.getElementById('powType');
            const expDiv = document.getElementById('powerExponentDiv');
            const toggleExp = () => {
                if (powType.value === 'power') expDiv.style.display = 'block';
                else expDiv.style.display = 'none';
            };
            powType.addEventListener('change', toggleExp);
            toggleExp();
        }

        resultDiv.innerHTML = 'نتیجه در اینجا نمایش داده می‌شود.';
        updateFormula();
    }

    function calculate() {
        const topic = topicSelect.value;
        let result = '';

        try {
            if (topic === 'geometry') {
                const shape = shapeSelect.value;
                let a,b,r,base,h,edge,radius;
                switch(shape) {
                    case 'square':
                        a = parseFloat(document.getElementById('a')?.value);
                        if (isNaN(a)) throw new Error('ضلع را وارد کنید');
                        result = `مساحت مربع: ${a*a} cm² | محیط: ${4*a} cm`;
                        break;
                    case 'rectangle':
                        a = parseFloat(document.getElementById('length')?.value);
                        b = parseFloat(document.getElementById('width')?.value);
                        if (isNaN(a)||isNaN(b)) throw new Error('طول و عرض را وارد کنید');
                        result = `مساحت: ${a*b} cm² | محیط: ${2*(a+b)} cm`;
                        break;
                    case 'circle':
                        r = parseFloat(document.getElementById('r')?.value);
                        if (isNaN(r)) throw new Error('شعاع را وارد کنید');
                        
                        // بهبود آموزشی عالی: نمایش هر دو حالت پی مدرسه و پی دقیق دانشگاهی
                        const areaSchool = (3.14 * r * r).toFixed(2);
                        const perimeterSchool = (2 * 3.14 * r).toFixed(2);
                        const areaExact = (Math.PI * r * r).toFixed(2);
                        const perimeterExact = (2 * Math.PI * r).toFixed(2);
                        
                        result = `<br>🏫 حالت مدرسه (پی = ۳.۱۴): مساحت ≈ ${areaSchool} cm² | محیط ≈ ${perimeterSchool} cm<br>` + 
                                 `🔬 حالت دقیق ریاضی: مساحت ≈ ${areaExact} cm² | محیط ≈ ${perimeterExact} cm`;
                        break;
                    case 'triangle':
                        base = parseFloat(document.getElementById('base')?.value);
                        h = parseFloat(document.getElementById('height')?.value);
                        if (isNaN(base)||isNaN(h)) throw new Error('قاعده و ارتفاع را وارد کنید');
                        result = `مساحت مثلث: ${0.5*base*h} cm²`;
                        break;
                    case 'cube':
                        edge = parseFloat(document.getElementById('edge')?.value);
                        if (isNaN(edge)) throw new Error('یال را وارد کنید');
                        result = `حجم مکعب: ${edge*edge*edge} cm³ | مساحت کل: ${6*edge*edge} cm²`;
                        break;
                    case 'sphere':
                        radius = parseFloat(document.getElementById('radius')?.value);
                        if (isNaN(radius)) throw new Error('شعاع را وارد کنید');
                        
                        const volSchool = ((4/3) * 3.14 * Math.pow(radius, 3)).toFixed(2);
                        const volExact = ((4/3) * Math.PI * Math.pow(radius, 3)).toFixed(2);
                        
                        result = `<br>🏫 حالت مدرسه (پی = ۳.۱۴): حجم کره ≈ ${volSchool} cm³<br>` +
                                 `🔬 حالت دقیق ریاضی: حجم کره ≈ ${volExact} cm³`;
                        break;
                }
            }
            else if (topic === 'percent') {
                const type = document.getElementById('percentType').value;
                const mainNum = parseFloat(document.getElementById('mainNum')?.value);
                const val = parseFloat(document.getElementById('percentOrPart')?.value);
                if (isNaN(mainNum) || isNaN(val)) throw new Error('اعداد را کامل وارد کنید');
                if (type === 'percentOf') {
                    const percentValue = (val * mainNum) / 100;
                    result = `${val} درصد از ${mainNum} برابر است با: ${percentValue}`;
                } else {
                    if (mainNum === 0) throw new Error('تقسیم بر صفر');
                    const percent = (val * 100) / mainNum;
                    result = `${val} از ${mainNum} برابر با ${percent.toFixed(2)}٪ است.`;
                }
            }
            else if (topic === 'fraction') {
                const num = parseFloat(document.getElementById('numerator')?.value);
                const den = parseFloat(document.getElementById('denominator')?.value);
                if (isNaN(num) || isNaN(den) || den === 0) throw new Error('عدد نامعتبر یا مخرج صفر');
                const op = document.getElementById('fracOp').value;
                if (op === 'decimal') {
                    result = `کسر ${num}/${den} برابر با اعشار: ${(num/den).toFixed(4)}`;
                } else {
                    function gcd(a,b) {
                        a = Math.abs(a); b = Math.abs(b);
                        while(b !== 0) { let t = b; b = a % b; a = t; }
                        return a;
                    }
                    let g = gcd(num, den);
                    let newNum = num/g, newDen = den/g;
                    result = `کسر ساده شده: ${newNum} / ${newDen}`;
                }
            }
            else if (topic === 'power') {
                const baseVal = parseFloat(document.getElementById('baseNum')?.value);
                if (isNaN(baseVal)) throw new Error('عدد پایه را وارد کنید');
                const powType = document.getElementById('powType').value;
                if (powType === 'power') {
                    const exp = parseFloat(document.getElementById('exponent')?.value);
                    if (isNaN(exp)) throw new Error('نما را وارد کنید');
                    result = `${baseVal} ^ ${exp} = ${Math.pow(baseVal, exp)}`;
                } else {
                    if (baseVal < 0) throw new Error('جذر اعداد منفی در اعداد حقیقی تعریف نشده');
                    result = `√${baseVal} = ${Math.sqrt(baseVal)}`;
                }
            }
            else if (topic === 'equation') {
                let a = parseFloat(document.getElementById('coeffA')?.value);
                let b = parseFloat(document.getElementById('constB')?.value);
                let c = parseFloat(document.getElementById('constC')?.value);
                if (isNaN(a) || isNaN(b) || isNaN(c)) throw new Error('ضرایب را کامل وارد کنید');
                if (a === 0) throw new Error('ضریب a نمی‌تواند صفر باشد');
                let x = (c - b) / a;
                result = `جواب معادله ${a}x + ${b} = ${c}  =>  x = ${x}`;
            }
            else {
                result = 'موضوع نامعتبر';
            }
            resultDiv.innerHTML = `✅ ${result}`;
        } catch(err) {
            resultDiv.innerHTML = `❌ خطا: ${err.message}`;
        }
    }

    topicSelect.addEventListener('change', () => {
        toggleGeometryShape();
        updateInputs();
    });
    shapeSelect.addEventListener('change', () => {
        if (topicSelect.value === 'geometry') updateInputs();
    });
    calcBtn.addEventListener('click', calculate);

    toggleGeometryShape();
    updateInputs();
});
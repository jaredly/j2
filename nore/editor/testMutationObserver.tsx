export const testMutationObserver = () => {
    const div = document.createElement('div');
    document.body.append(div);
    div.style.display = 'none';
    let called = false;
    const mu = new MutationObserver(() => {
        called = true;
    });
    mu.observe(div, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
    });
    div.textContent = 'ok';
    setTimeout(() => {
        if (!called) {
            console.error(`MutationObserver is not firing!!!`);
            div.textContent = 'ERROR MutationObserver is not firing!!!';
            Object.assign(div.style, {
                display: 'block',
                position: 'fixed',
                top: 24,
                left: 24,
                backgroundColor: 'red',
                fontSize: 48,
                padding: 24,
            });
        } else {
            div.remove();
        }
        mu.disconnect();
    }, 100);
};

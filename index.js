function $(selector) {
  const result = document.querySelectorAll(selector);
  return result.length > 1 ? result : result[0];
};

function $$({ children }) {
  return Array.from(children);
};

class Carousel {
  constructor(
    shouldLoop,
    initialIdx = 0,
    transitionTime = 300,
    peeking = true,
  ) {
    this.carousel = $('.carousel');
    this.wrapper = $('.section-wrapper');
    this.btnPrev = $('.nav-button-prev');
    this.btnNext = $('.nav-button-next');
    this.navDots = $('.nav-dots');

    this.carousel.style.overflow = peeking ? 'visible' : 'hidden';

    const { length } = $$(this.wrapper);
    const currentIdx = Math.abs(initialIdx + length) % length + (shouldLoop ? length : 0);
    this.state = {
      length,
      currentIdx,
      delta: 0,
      initialIdx: currentIdx,
      transitionTime,
      shouldLoop,
      skipTransition: false,
      onTransition: false,
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
  }

  init() {
    if (this.state.shouldLoop) {
      this.dupSections();
    } else {
      this.updateNavBtns();
      this.renderNavDots();
    }
    
    this.setupEventHandlers();
    this.center();
  }

  updateNavBtns() {
    const { currentIdx, length } = this.state;
    this.btnPrev.style.display = currentIdx === 0 ? 'none' : 'inline-block';
    this.btnNext.style.display = currentIdx === length - 1 ? 'none' : 'inline-block';
  }

  updateNavDots() {
    $$(this.navDots).forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.state.currentIdx);
    });
  }

  renderNavDots() {
    const dots = $$(this.wrapper).map((_, idx) => {
      const dot = document.createElement('a');
      dot.className = 'nav-dot';
      dot.onclick = () => this.goTo(idx);
      return dot;
    })

    this.navDots.append(...dots);
    this.updateNavDots();
  }

  dupSections() {
    const children = $$(this.wrapper);
    const dup = children.map(child => child.cloneNode(true));
    const dup2 = children.map(child => child.cloneNode(true));

    this.wrapper.append(...dup, ...dup2);
    this.setState({ length: $$(this.wrapper).length });
  }

  updateClicks = () => {
    $$(this.wrapper).forEach((child, idx) => {
      child.onclick = () => this.goTo(idx);
    });
  }

  setupEventHandlers() {
    this.btnPrev.onclick = () => this.moveDelta(-1);
    this.btnNext.onclick = () => this.moveDelta(1);
    this.wrapper.addEventListener('transitionend', () => this.handleTransitionEnd());
    this.updateClicks();
  }

  handleTransitionEnd() {
    if (this.state.shouldLoop) {
      this.shuffle();
      this.center();
      this.updateClicks();
    }

    this.setState({ onTransition: false });
    this.updateNavBtns();
    this.updateNavDots();
  }

  shuffle() {
    const { delta } = this.state;
    const children = $$(this.wrapper);

    let pops;
    if (delta > 0) {
      pops = children.slice(0, delta);
      this.wrapper.append(...pops);
    } else {
      pops = children.slice(delta);
      pops.forEach(child => {
        this.wrapper.insertBefore(child, children[0]);
      });
    }
  }

  center() {
    this.setState({
      currentIdx: this.state.initialIdx,
      skipTransition: true,
    });

    this.move();

    this.setState({
      skipTransition: false,
      onTransition: false,
    });
  }

  moveDelta(delta) {
    const { currentIdx, shouldLoop, length } = this.state;

    const idx = shouldLoop
      ? (currentIdx + delta + length) % length
      : Math.min(length - 1, Math.max(0, currentIdx + delta));
    this.goTo(idx);
  }

  goTo(idx) {
    const { currentIdx, onTransition } = this.state;
    const delta = idx - currentIdx;
    if (!delta || onTransition) return;

    this.setState({
      currentIdx: idx,
      delta,
    });
    this.move();
  }

  move() {
    this.setState({ onTransition: true });
    const { currentIdx, skipTransition, transitionTime } = this.state;

    this.wrapper.style.transform = `translateX(${-currentIdx * 100}%)`;
    this.wrapper.style.transition = skipTransition ? 'none' : `transform ${transitionTime}ms`;
  }
}

const shouldLoop = !!Math.round(Math.random());
const demo = new Carousel(shouldLoop);
demo.init();
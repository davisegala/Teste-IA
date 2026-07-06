export const SoundSystem = {
    ctx: null,
    init() { if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    play(type) {
        this.init(); if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);

        if (type === 'break') {
            osc.type = 'square'; osc.frequency.setValueAtTime(75, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.07);
            osc.start(); osc.stop(this.ctx.currentTime + 0.07);
        } else if (type === 'craft') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(440, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(660, this.ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
            osc.start(); osc.stop(this.ctx.currentTime + 0.1);
        } else if (type === 'fire') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(50 + Math.random() * 40, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.04);
            osc.start(); osc.stop(this.ctx.currentTime + 0.04);
        }
    }
};
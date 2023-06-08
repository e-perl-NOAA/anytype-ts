import * as React from 'react';
import $ from 'jquery';
import { Loader } from 'Component';
import { I, keyboard, UtilCommon } from 'Lib';
import { commonStore } from 'Store';

const BORDER = 16;

class PopupPreview extends React.Component<I.Popup> {
	
	render () {
		const { param, close } = this.props;
		const { data } = param;
		const { src, type } = data;

		let content = null;

		switch (type) {
			case I.FileType.Image: {
				content = <img className="media" src={src} onClick={() => close()} />
				break;
			};

			case I.FileType.Video: {
				content = <video src={src} controls={true} autoPlay={true} loop={true} />;
				break
			};
		};

		return (
			<div>
				<Loader id="loader" />
				<div id="wrap" className="wrap">
					{content}
				</div>
			</div>
		);
	};
	
	componentDidMount () {
		this.resize();
		this.rebind();
	};
	
	componentDidUpdate () {
		this.resize();
	};

	componentWillUnmount () {
		this.unbind();
	};

	unbind () {
		$(window).off('resize.popupPreview keydown.popupPreview');
	};

	rebind () {
		this.unbind();

		const win = $(window);
		win.on('resize.popupPreview', () => { this.resize(); });
		win.on('keydown.menu', (e: any) => { this.onKeyDown(e); });
	};

	onKeyDown (e: any) {
		keyboard.shortcut('escape', e, () => this.props.close());
	};
	
	resize () {
		const { param, getId, position } = this.props;
		const { data } = param;
		const { src, type } = data;
		const obj = $(`#${getId()}-innerWrap`);
		const wrap = obj.find('#wrap');
		const loader = obj.find('#loader');
		const { ww, wh } = UtilCommon.getWindowDimensions();
		const mh = wh - BORDER * 2;
		const sidebar = $('#sidebar');

		let mw = ww - BORDER * 2;
		if (commonStore.isSidebarFixed && sidebar.hasClass('active')) {
			mw -= sidebar.outerWidth();
		};

		const onError = () => {
			wrap.addClass('brokenMedia');
			loader.remove();
		};

		switch (type) {
			case I.FileType.Image: {
				wrap.css({ height: 450, width: 300 });
				position();

				const img = new Image();
				img.onload = () => {
					const cw = img.width;
					const ch = img.height;

					let width = 0, height = 0;
					if (cw > ch) {
						width = Math.min(mw, cw);
						height = Math.min(mh, width / (cw / ch));
					} else {
						height = Math.min(mh, ch);
						width = Math.min(mw, height / (ch / cw));
					};

					wrap.css({ height, width });
					loader.remove();
					position();
				};

				img.onerror = onError;

				img.src = src;
				break;
			};

			case I.FileType.Video: {
				const video = obj.find('video').get(0);
				const width = 672;
				const height = 382;

				video.oncanplay = () => { loader.remove(); };
				video.onerror = onError;

				wrap.css({ height, width });
				$(video).css({ height, width });
				position();
			};
		};

	};
	
};

export default PopupPreview;
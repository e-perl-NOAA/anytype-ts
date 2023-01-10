import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import { Input, Icon } from 'Component';
import { I, translate } from 'Lib';

interface Props {
	id?: string;
	className?: string;
	inputClassName?: string;
	icon?: string;
	value?: string;
	placeholder?: string;
	placeholderFocus?: string;
	onClick?(e: any): void;
	onFocus?(e: any): void;
	onBlur?(e: any): void;
	onKeyDown?(e: any, v: string): void;
	onKeyUp?(e: any, v: string): void;
	onChange?(value: string): void;
	onClear?(): void;
};


class Filter extends React.Component<Props, object> {

	public static defaultProps = {
		className: '',
		inputClassName: '',
		placeholder: translate('commonFilterClick'),
	};
	
	isFocused: boolean = false;
	placeholder: any = null;
	ref: any = null;

	constructor (props: any) {
		super(props);

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onClear = this.onClear.bind(this);
	};
	
	render () {
		const { id, value, icon, placeholder, className, inputClassName, onKeyDown, onKeyUp, onClick } = this.props;
		const cn = [ 'filter', className ];

		return (
			<div id={id} className={cn.join(' ')} onClick={onClick}>
				<div className="inner">
					{icon ? <Icon className={icon} /> : ''}

					<div className="filterInputWrap">
						<Input 
							ref={(ref: any) => { this.ref = ref; }}
							id="input"
							className={inputClassName}
							value={value}
							onFocus={this.onFocus} 
							onBlur={this.onBlur} 
							onChange={this.onChange} 
							onKeyDown={onKeyDown}
							onKeyUp={onKeyUp}
						/>
						<div id="placeholder" className="placeholder">{placeholder}</div>
					</div>

					<Icon className="clear" onClick={this.onClear} />
				</div>
				<div className="line" />
			</div>
		);
	};

	componentDidMount() {
		const node = $(ReactDOM.findDOMNode(this));

		this.ref.setValue(this.props.value);
		this.placeholder = node.find('#placeholder');
		this.resize();
	};

	componentDidUpdate () {
		this.checkButton();
	};

	focus () {
		this.addFocusedClass();
		this.ref.focus();
		this.checkButton();
	};

	blur () {
		this.removeFocusedClass();
		this.ref.blur();
	};

	setRange (range: I.TextRange) {
		this.ref.setRange(range);
	};

	onFocus (e: any) {
		const { placeholderFocus, onFocus } = this.props;

		this.isFocused = true;
		this.addFocusedClass();

		if (placeholderFocus) {
			this.placeholderSet(placeholderFocus);
		};

		if (onFocus) { 
			onFocus(e);
		};
	};
	
	onBlur (e: any) {
		const { placeholderFocus, placeholder, onBlur } = this.props;

		this.isFocused = false;
		this.removeFocusedClass();

		if (placeholderFocus) {
			this.placeholderSet(placeholder);
		};

		if (onBlur) {
			onBlur(e);
		};
	};

	addFocusedClass () {
		const node = $(ReactDOM.findDOMNode(this));
		node.addClass('isFocused');
	};

	removeFocusedClass () {
		const node = $(ReactDOM.findDOMNode(this));
		node.removeClass('isFocused');
	};

	onClear (e: any) {
		e.preventDefault();
		e.stopPropagation();

		const { onClear } = this.props;

		this.ref.setValue('');
		this.ref.focus();
		this.onChange(e, '');

		if (onClear) {
			onClear();
		};
	};

	onChange (e: any, v: string) {	
		const { onChange } = this.props;

		this.checkButton();
		this.placeholderCheck();

		if (onChange) {
			onChange(v);
		};
	};

	checkButton () {
		const node = $(ReactDOM.findDOMNode(this));
		const v = this.getValue();

		v ? node.addClass('active') : node.removeClass('active');
	};

	setValue (v: string) {
		this.ref.setValue(v);
		this.checkButton();
		this.placeholderCheck();
	};

	getValue () {
		return this.ref.getValue();
	};

	placeholderCheck () {
		this.getValue() ? this.placeholderHide() : this.placeholderShow();	
	};

	placeholderSet (v: string) {
		this.placeholder.text(v);
	};
	
	placeholderHide () {
		this.placeholder.hide();
	};

	placeholderShow () {
		this.placeholder.show();
	};

	resize () {
		this.placeholder.css({ lineHeight: this.placeholder.height() + 'px' });
	};

};

export default Filter;
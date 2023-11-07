import * as React from 'react';
import { Title, Icon, Label, Button, ObjectDescription, ListObjectManager } from 'Component';
import { analytics, C, I, keyboard, translate } from 'Lib';
import { observer } from 'mobx-react';

const PopupImport = observer(class PopupImport extends React.Component<I.Popup> {

	refManager = null;

	constructor (props: I.Popup) {
		super(props);
		
		this.onClick = this.onClick.bind(this);
		this.onCancel = this.onCancel.bind(this);
	};

	render () {
		const { param, getId } = this.props;
		const { data } = param;
		const { collectionId } = data;
		const subId = [getId(), 'data'].join('-');

		const Info = (item: any) => (
			<ObjectDescription object={item} />
		);

		return (
			<React.Fragment>
				<Title text={translate('popupSettingsImportFavouriteTitle')} />

				<ListObjectManager
					ref={ref => this.refManager = ref}
					subId={subId}
					rowLength={2}
					withArchived={true}
					buttons={[]}
					Info={Info}
					iconSize={48}
					collectionId={collectionId}
					textEmpty={translate('popupSettingsSpaceStorageManagerEmptyLabel')}
				/>

				<Button text={translate('commonDone')} onClick={this.onClick} />
			</React.Fragment>
		);
	};

	componentDidMount() {
		keyboard.setFocus(true);

		this.rebind();
	};

	componentWillUnmount() {
		keyboard.setFocus(false);

		this.unbind();
	};

	rebind () {
		this.unbind();
		$(window).on('keydown.confirm', e => this.onKeyDown(e));
	};

	unbind () {
		$(window).off('keydown.confirm');
	};

	onKeyDown (e: any) {
		keyboard.shortcut('enter, space', e, (pressed: string) => {
			e.stopPropagation();
			this.onClick(e);
		});

		keyboard.shortcut('escape', e, (pressed: string) => {
			e.stopPropagation();
			this.onCancel(e);
		});
	};
	
	onClick (e: any) {
		e.preventDefault();

		const { param } = this.props;
		const { data } = param;
		const { collectionId } = data;

		C.ObjectListSetIsFavorite(this.refManager.selected, true);
		C.ObjectSetIsFavorite(collectionId, false);

		this.props.close();
	};

	onCancel (e: any) {
		this.props.close();
	};
	
});

export default PopupImport;

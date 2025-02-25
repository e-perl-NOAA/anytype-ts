import * as React from 'react';
import $ from 'jquery';
import { observer } from 'mobx-react';
import { I, J, S, sidebar, translate, U } from 'Lib';
import { Icon, IconObject, ObjectName } from 'Component';
import { AutoSizer, CellMeasurer, InfiniteLoader, List, CellMeasurerCache } from 'react-virtualized';

interface Props extends React.Component {
	page: string;
};

const LIMIT = 30;
const HEIGHT_ITEM = 28;
const HEIGHT_SECTION = 38;
const HEIGHT_SECTION_FIRST = 34;
const HEIGHT_ACCOUNT = 56;

const SidebarSettings = observer(class SidebarSettings extends React.Component<Props, {}> {

	node: any = null;
	routeBack: any = null;
	toggle: any = {
		contentModelTypes: false,
		contentModelFields: false,
	};

	cache: any = {};

	render () {
		const space = U.Space.getSpaceview();
		const { membership } = S.Auth;
		const profile = U.Space.getProfile();
		const participant = U.Space.getParticipant() || profile;
		const pathname = U.Router.getRoute();
		const param = U.Router.getParam(pathname);
		const isSpace = this.props.page == 'settingsSpace';

		const items = this.getItems();

		const onBack = () => {
			if (!this.routeBack || !this.routeBack.pathname) {
				U.Space.openDashboard('route');
				return;
			};

			U.Router.go(this.routeBack.pathname, {});
		};

		const Item = (item: any) => {
			const cn = [ 'item' ];

			let icon = null;
			let name = null;
			let caption = null;

			if (item.isToggle) {
				return (
					<div className={[ 'toggle', this.toggle[item.id] ? 'isOpen' : '' ].join(' ')} onClick={() => this.onToggle(item)}>
						<Icon />
						{item.name}
					</div>
				);
			} else
			if (item.isSection) {
				return <div className={[ 'section', item.isFirst ? 'isFirst' : '' ].join(' ')}><div className="name">{item.name}</div></div>;
			};

			if (item.id == param.id || (item.subPages && item.subPages.includes(param.id))) {
				cn.push('active');
			};

			if (item.id == 'account') {
				if ('index' == param.id) {
					cn.push('active');
				};

				if (participant) {
					name = participant?.globalName || participant?.name;
					icon = <IconObject object={{ ...participant, name }} size={36} iconSize={36} />;
				};

				cn.push('itemAccount');
			} else {
				icon = <Icon className={`settings-${item.icon || item.id}`} />;
				name = item.name;
			};

			if (item.id == 'membership') {
				if (!membership.isNone) {
					const tierItem = U.Data.getMembershipTier(membership.tier);
					caption = <div className="caption">{tierItem.name}</div>;
				} else {
					caption = <div className="caption join">{translate(`commonJoin`)}</div>;
				};
			};

			if (U.Object.isTypeOrRelationLayout(item.layout)) {
				cn.push('isTypeOrRelation');

				icon = <IconObject object={item} />;
			};

			return (
				<div
					id={`item-${item.id}`}
					className={cn.join(' ')}
					onClick={() => this.onClick(item)}
				>
					{icon}
					<div className="name">{name}</div>

					{caption}
				</div>
			);
		};

		const rowRenderer = ({ index, key, parent, style }) => (
			<CellMeasurer
				key={key}
				parent={parent}
				cache={this.cache}
				columnIndex={0}
				rowIndex={index}
			>
				<div className="row" style={style}>
					<Item {...items[index]} />
				</div>
			</CellMeasurer>
		);

		return (
			<div 
				ref={ref => this.node = ref} 
				id="containerSettings" 
				className={isSpace ? 'spaceSettings' : 'appSettings'}
			>
				<div className="head" />

				<div className="body">
					<div className="list">
						{isSpace ? (
							<div className="head" onClick={onBack}>
								<Icon className="back" />
								<ObjectName object={space} />
							</div>
						) : ''}
						<div className="inner">
							<InfiniteLoader
								rowCount={items.length}
								loadMoreRows={() => {}}
								isRowLoaded={() => true}
								threshold={LIMIT}
							>
								{({ onRowsRendered }) => (
									<AutoSizer className="scrollArea">
										{({ width, height }) => (
											<List
												width={width}
												height={height}
												deferredMeasurmentCache={this.cache}
												rowCount={items.length}
												rowHeight={({ index }) => this.getRowHeight(items[index])}
												rowRenderer={rowRenderer}
												onRowsRendered={onRowsRendered}
												overscanRowCount={10}
												scrollToAlignment="center"
											/>
										)}
									</AutoSizer>
								)}
							</InfiniteLoader>
						</div>

						{!isSpace ? (
							<div className="logout" onClick={() => S.Popup.open('logout', {})}>
								<Icon />
								{translate('commonLogout')}
							</div>
						) : ''}
					</div>
				</div>
			</div>
		);
	};

	componentDidMount () {
		const history = U.Router.history;
		const items = this.getItems();

		this.cache = new CellMeasurerCache({
			fixedWidth: true,
			defaultHeight: i => this.getRowHeight(items[i]),
			keyMapper: i => (items[i] || {}).id,
		});

		this.routeBack = history.entries[history.index - 1];
	};

	componentDidUpdate () {
	};

	getSections (): any[] {
		const canWrite = U.Space.canMyParticipantWrite();
		const isSpace = this.props.page == 'settingsSpace';
		const settingsVault = [
			{ id: 'spaceList', name: translate('popupSettingsSpacesListTitle'), icon: 'spaces' },
			{ id: 'dataIndex', name: translate('popupSettingsDataManagementTitle'), icon: 'storage', subPages: [ 'dataPublish', 'delete' ] },
			{ id: 'phrase', name: translate('popupSettingsPhraseTitle') },
		];

		if (this.withMembership()) {
			settingsVault.push({ id: 'membership', icon: 'membership', name: translate('popupSettingsMembershipTitle1') });
		};

		const appSettings = [
			{ id: 'account', children: [ { id: 'account', name: translate('popupSettingsProfileTitle') } ] },
			{
				id: 'basicSettings', name: translate('popupSettingsApplicationTitle'), children: [
					{ id: 'personal', name: translate('popupSettingsPersonalTitle') },
					{ id: 'language', name: translate('pageSettingsLanguageTitle') },
					{ id: 'pinIndex', name: translate('popupSettingsPinTitle'), icon: 'pin', subPages: [ 'pinSelect', 'pinConfirm' ] },
				]
			},
			{ id: 'vaultSettings', name: translate('popupSettingsAccountAndKeyTitle'), children: settingsVault }
		];

		const importExport = [{
			id: 'exportIndex', icon: 'export', name: translate('commonExport'),
			subPages: [ 'exportProtobuf', 'exportMarkdown' ]
		}];

		if (canWrite) {
			importExport.unshift({
				id: 'importIndex', icon: 'import', name: translate('commonImport'),
				subPages: [ 'importNotion', 'importNotionHelp', 'importNotionWarning', 'importCsv' ]
			});
		};

		const spaceSettings = [
			{ id: 'common', name: translate('commonPreferences'), children: [
					{ id: 'spaceIndex', icon: 'space', name: translate('pageSettingsSpaceGeneral') },
					{ id: 'spaceShare', icon: 'members', name: translate('commonMembers') },
					{ id: 'spaceStorageManager', icon: 'storage', name: translate('pageSettingsSpaceRemoteStorage') },
				]
			},
			{ id: 'integrations', name: translate('pageSettingsSpaceIntegrations'), children: importExport },

			{ id: 'contentModel', name: translate('pageSettingsSpaceManageContent'), isLabel: true },
			{ id: 'contentModelTypes', isToggle: true, name: U.Common.plural(10, translate('pluralObjectType')), children: S.Record.getTypes() },
			{ id: 'contentModelFields', isToggle: true, name: U.Common.plural(10, translate('pluralField')), children: S.Record.getRelations() },
		];

		return isSpace ? spaceSettings : appSettings;
	};

	getItems () {
		const sections = this.getSections();

		let items: any[] = [];

		for (const section of sections) {

		};

		sections.forEach((section, idx) => {
			if (section.name) {
				const item: any = { id: section.id, name: section.name, isSection: true };

				if (section.isToggle) {
					item.isToggle = true;
				};

				if (idx == 0) {
					item.isFirst = true;
				};

				items.push(item);
			};

			let children = section.children ? section.children : [];
			if (section.isToggle && !this.toggle[section.id]) {
				children = [];
			};

			items = items.concat(children);
		});

		return items;
	};

	getRowHeight (item: any) {
		if (item.isToggle) {
			return HEIGHT_ITEM;
		};
		if (item.isSection) {
			return item.isFirst ? HEIGHT_SECTION_FIRST : HEIGHT_SECTION;
		};
		if (item.id == 'account') {
			return HEIGHT_ACCOUNT;
		};
		return HEIGHT_ITEM;
	};

	withMembership () {
		return S.Common.isOnline && U.Data.isAnytypeNetwork();
	};

	onClick (item) {
		let param = {
			id: item.id,
			layout: I.ObjectLayout.Settings, 
		};

		if (U.Object.isTypeOrRelationLayout(item.layout)) {
			param = Object.assign(param, {
				id: 'type',
				_routeParam_: { 
					additional: [ 
						{ key: 'objectId', value: item.id } 
					],
				},
			});
		};

		U.Object.openAuto(param);
	};

	onToggle (item) {
		if (this.toggle[item.id]) {
			this.toggle[item.id] = false;
		} else {
			this.toggle[item.id] = true;
		};

		this.forceUpdate();
	};

});

export default SidebarSettings

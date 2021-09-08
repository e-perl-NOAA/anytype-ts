import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { IconObject, Cover } from 'ts/component';
import { I, M, DataUtil, translate } from 'ts/lib';
import { observer } from 'mobx-react';

interface Props extends I.BlockComponent, RouteComponentProps<any> {
    withIcon?: boolean;
    withCover?: boolean;
    iconSize: number;
    object: any;
    className?: string;
    canEdit?: boolean;
    onSelect?(id: string): void;
	onUpload?(hash: string): void;
	onCheckbox?(e: any): void;
    onClick?(e: any): void;
};

const LinkCard = observer(class LinkCard extends React.Component<Props, {}> {

	render () {
        const { rootId, block, withIcon, withCover, object, className, canEdit, onClick, onSelect, onUpload, onCheckbox } = this.props;
        const { id, layout, coverType, coverId, coverX, coverY, coverScale, name, description } = object;
        const { align } = block;
        const cn = [ 'linkCard', 'align' + align, DataUtil.layoutClass(id, layout) ];
        const featured: any = new M.Block({ id: rootId + '-featured', type: I.BlockType.Featured, align: align, childrenIds: [], fields: {}, content: {} });

        if (className) {
            cn.push(className);
        };
        if (withCover && coverId && coverType) {
            cn.push('withCover');
        };

        let iconSize = this.props.iconSize;
        if (layout == I.ObjectLayout.Task) {
            iconSize = 16;
        };

        cn.push('c' + iconSize);

        const sideLeft = withIcon ? (
            <div className="side left">
                <IconObject size={iconSize} object={object} canEdit={canEdit} onSelect={onSelect} onUpload={onUpload} onCheckbox={onCheckbox} />
            </div>
        ) : null;

        const sideRight = (
            <div className="side right">
                <div className="cardName">{name}</div>
                <div className="cardDescription">{description}</div>
                <div className="archive">{translate('blockLinkArchived')}</div>

                {/*<Block {...this.props} rootId={block.content.targetBlockId} iconSize={18} block={featured} readonly={true} className="noPlus" />*/}
            </div>
        ); 

        let content = (
            <div className="sides">
                {align == I.BlockAlign.Right ? (
                    <React.Fragment>
                        {sideRight}
                        {sideLeft}
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        {sideLeft}
                        {sideRight}
                    </React.Fragment>
                )}
            </div>
        );

		return (
			<div className={cn.join(' ')} onMouseDown={onClick}>
                {withCover && coverId && coverType ? (
                    <Cover type={coverType} id={coverId} image={coverId} className={coverId} x={coverX} y={coverY} scale={coverScale} withScale={true}>
                        {content}
                    </Cover>
                ) : (
                    <React.Fragment>
                        {content}
                    </React.Fragment>
                )}
			</div>
		);
	};

});

export default LinkCard;
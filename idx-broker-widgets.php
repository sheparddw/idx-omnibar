<?php//Prevent Unauthorized Accessdefined( 'ABSPATH' ) or die( 'Unauthorized Access' );/** * File to manpulate IDX widgets. Create widgets based upon IDX widget API. * Based upon API response, iterate through array and create classes for widgets. * @author IDX, LLC */// IDX_Widget class provides a 'factory'-like class for the creation of widgets below this class definition.// Doing it this way allows us to give the dynamic class access to all of WP_Widget's methodsclass IDX_Widget extends WP_Widget {    public $widgetClass; // holds name of widget's class, ex: widget_596_12345    public $widgetURL; // URL location of widget's JS file in IDX MW    public $widgetID; // id of widget, ex: idx596_12345    function IDX_Widget () { // failed experiment    } // end IDX_Widget construct    function widget ($args, $instance) {        /**         * vars contained in $args:         * name ->  Title of the containing div (ex: Main Widget Area or Secondary Widget Area)         * id   ->  sidebar-1 or location of widget on page         * description  ->  Description of what the containing div does         * class    -> unknown         * before_widget    -> output before widget drawn         * before_title -> output before widget title drawn         * after_title  -> same as above but drawn after. after_title must come before after_widget         * after_widget -> same as above but drawn after         * widget_id    -> IDX widget class appended with revision if there are multiple widgets with same UID, such as cached. (ex: idx596_15570-2)         * widget_name  ->  IDX Name assigned within plat MW         */        /**         * vars contained in $instance:         * title -> title assigned within WP UI Widgets Editor         */        /**         * IDX props for IDX widget objects         * uid  -> AID-WidgetID (ex: 596-12345)         * name -> Title assigned within IDX Broker MW         * url  -> Link to the widget hosted in our MW         */        extract($args); // vars contained within        echo $before_widget;        echo $before_title;        if ($instance['title'] == '!%hide_title!%') // if client puts in '!%hide_title!%' for widget title in WP front-end, will display no title            echo '';        else if(!empty($instance['title'])) // else if WP title isn't empty, display that            echo $instance['title'];        else            echo $widget_name; // if no WP title and not specifically set to 'none', display IDX Widget title which is in $args param        echo $after_title;        echo "<script src='{$this->widgetURL}'></script>";        echo $after_widget;    } // end widget function    /**     * form will display a editing UI for changing widget title     * @param  [array] $instance [description]     * @return [type]           [description]     */    function form ($instance) {        $title = (isset($instance['title'])) ? $instance['title'] : ''; // if instance has a title already, display that pup, otherwise display empty input        echo "<div id='{$this->widgetID}-admin-panel'>";        echo "<label for='{$this->get_field_id('title')}'>Widget Title:</label>";        echo "<input type='text' name='{$this->get_field_name('title')}' id='{$this->get_field_id('title')}' value='{$title}' />";        echo "<br /><br />";        echo "</div>";    } // end form fn    /**     * update will take new values inputted into the editor and return the values after stripping the tags     * @param  [array] $new_instance [new vals]     * @param  [array] $old_instance [old vals]     * @return [array]               [new vals w/ tags stripped]     */    function update ($new_instance, $old_instance) {        $return = array();        $return['title'] = strip_tags($new_instance['title']);        $return['text'] = strip_tags($new_instance['text']);        $return['textarea'] = strip_tags($new_instance['textarea']);        return $return;    } // end update fn} // end IDX_Widget class definition$widgetCache = get_transient('idx_widgetrc_cache');$idxWidgets = ($widgetCache) ? $widgetCache : idx_api_get_widgetsrc();if (is_array($idxWidgets)) {    foreach ($idxWidgets as $widget) {        if (!is_numeric(str_replace('-', '', $widget->uid))) // if widget UID is not numeric after removing dashes, then it's not in proper format, continue to next widget            continue;        $widgetClass = "widget_" . str_replace('-', '_', $widget->uid); // format class name, ex: widget_596-12345        $widgetID = "idx" . str_replace('-','_', $widget->uid);        $badChars = array('{', '}', '[', ']', '%'); // remove any potential braces or other script breaking characters, then escape them using WP's function esc_html        $widgetTitle = "IDX ". esc_html(str_replace($badChars, '', $widget->name)); // set widget title to "IDX [name]"        $widgetOps = "array('classname' => '{$widgetClass}',                        'description' => __('$widgetTitle', 'text domain'))"; // to be eval'd upon class creation below        // easiest manner to create a dynamically named class is to eval a string to do it for us.        // all the variables above are escaped properly to prevent any breakage from using the eval function        // upon creation of the new widget class, it will extend the IDX_Widget class created above, which extends WP_Widget        $eval = "class {$widgetClass} extends IDX_Widget {            function __construct() {               WP_Widget::__construct('{$widgetID}', __('{$widgetTitle}', 'text domain'), $widgetOps);                \$this->widgetURL = '{$widget->url}';                \$this->widgetClass = '{$widgetClass}';                \$this->widgetID = '{$widgetID}';            }}";        eval($eval);        add_action('widgets_init', create_function('', "return register_widget('{$widgetClass}');")); // attach the newly created widget class to the WP widget initializier    }}